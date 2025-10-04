<script setup>
import { ref, onMounted } from 'vue';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { sharedState } from '../components/store';

const apiKey = ref('');
const attendanceData = ref('');
const analysisResult = ref(null);
const isLoading = ref(false);
const error = ref(null);
const targetDate = ref('');

onMounted(() => {
  apiKey.value = sharedState.apiKey;
  attendanceData.value = sharedState.rawAttendanceData;
  findTargetDateAndAnalyze();
});

function findTargetDateAndAnalyze() {
  if (!attendanceData.value) return;

  // Find the most recent date from the data to use as the target date
  const dateRegex = /(\d{1,2}\s[A-Z]+\s\d{4})/g;
  const dates = attendanceData.value.match(dateRegex) || [];
  if (dates.length > 0) {
    // Find the most frequent (latest) date
    const dateCounts = dates.reduce((acc, date) => {
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    targetDate.value = Object.keys(dateCounts).reduce((a, b) => dateCounts[a] > dateCounts[b] ? a : b);
  }

  // Automatically start analysis if we have data and an API key
  if (apiKey.value && attendanceData.value) {
    analyzeData();
  }
}

async function analyzeData() {
  if (!apiKey.value) {
    error.value = 'Please provide a Gemini API Key.';
    return;
  }
  if (!attendanceData.value) {
    error.value = 'Please paste the attendance data.';
    return;
  }

  isLoading.value = true;
  error.value = null;
  analysisResult.value = null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey.value);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Pre-process to get a unique list of all student names
    const studentNameRegex = /^(.*?)\n/gm;
    const allStudents = [...attendanceData.value.matchAll(studentNameRegex)].map(match => match[1].trim());
    const studentList = [...new Set(allStudents)].join(', ');

    const prompt = `
      You are an expert HR assistant responsible for checking employee attendance.
      Your task is to analyze the provided attendance data for the specific target date: "${targetDate.value}".
      The complete list of students who should be present is: ${studentList}.

      A student is considered absent on "${targetDate.value}" if:
      1. Their name does not appear in any entry for "${targetDate.value}".
      2. Their name appears in an entry for "${targetDate.value}", but either "ABSEN PAGI" or "ABSEN SORE" is missing a time value (is empty or just a dash).

      Return your analysis as a single, minified JSON object with one key: "absent_students". This key should hold an array of objects. Each object must represent an absent student and have two properties: "nama" (the student's name) and "alasan" (the reason for being marked absent, e.g., "Tidak ada data absensi untuk ${targetDate.value}" or "Absen sore tidak lengkap").

      Do not include any students who have complete attendance for "${targetDate.value}".

      Attendance Data:
      ---
      ${attendanceData.value}
      ---
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the response to ensure it's valid JSON
    const jsonString = text.replace(/```json|```/g, '').trim();
    analysisResult.value = JSON.parse(jsonString);

  } catch (e) {
    console.error('Error during analysis:', e);
    error.value = 'Failed to analyze data. Please check the API key and the data format. See console for details.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="analyzer-container">
    <h1>Attendance Analyzer</h1>
    <p>Data has been pre-filled. Click "Analyze" to check for students with incomplete attendance for the most recent date.</p>
  <p>MASIH DALAM TAHAP PENGEMBANGAN!</p>

    <div class="form-group">
      <label for="apiKey">Gemini API Key</label>
      <input id="apiKey" type="password" v-model="apiKey" placeholder="Enter your API Key here" />
    </div>

    <div class="form-group">
      <label for="data">Attendance Data</label>
      <textarea id="data" v-model="attendanceData" rows="10" placeholder="Paste the raw attendance data here..."></textarea>
    </div>

    <button @click="analyzeData" :disabled="isLoading">
      {{ isLoading ? 'Analyzing...' : 'Analyze' }}
    </button>

    <div v-if="isLoading" class="loading">Analyzing, please wait...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="analysisResult" class="results">
      <h2>Analysis Results</h2>
      <p>The following students have incomplete or missing attendance for <strong>{{ targetDate }}</strong>:</p>
      <ul v-if="analysisResult.absent_students && analysisResult.absent_students.length > 0">
        <li v-for="student in analysisResult.absent_students" :key="student.nama">
          <strong>{{ student.nama }}</strong> - {{ student.alasan }}
        </li>
      </ul>
      <p v-else>All students have complete attendance for {{ targetDate }}.</p>
    </div>
  </div>
</template>

<style scoped>
.analyzer-container { max-width: 800px; margin: 2rem auto; display: flex; flex-direction: column; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
label { font-weight: bold; color: var(--color-heading); }
input, textarea { padding: 0.8rem; border-radius: 8px; border: 1px solid var(--color-border); background-color: var(--color-background-soft); width: 100%; font-family: monospace; color: var(--color-text); }
button { padding: 0.8rem 1.5rem; border-radius: 8px; border: none; background-color: hsla(160, 100%, 37%, 1); color: white; font-weight: bold; cursor: pointer; transition: background-color 0.3s; }
button:disabled { background-color: #ccc; cursor: not-allowed; }
button:hover:not(:disabled) { background-color: hsla(160, 100%, 30%, 1); }
.loading { text-align: center; padding: 1rem; color: var(--color-text); }
.error { background-color: #ffdddd; border-left: 4px solid #f44336; padding: 1rem; color: #721c24; }
.results { margin-top: 2rem; background: var(--color-background-soft); padding: 1.5rem; border-radius: 12px; }
.results h2 { margin-top: 0; }
.results ul { padding-left: 20px; }
.results li { margin-bottom: 0.5rem; }
</style>