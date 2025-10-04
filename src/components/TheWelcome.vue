<template>
  <div class="welcome-container">
    <details open class="form-section card">
      <summary>Pengaturan & Ambil Data</summary>
      
      <div class="form-grid">
        <div class="form-group">
          <label for="user">User</label>
          <input id="user" type="text" class="form-control" v-model="data.user">
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" type="password" class="form-control" v-model="data.password">
        </div>
        <div class="form-group full-width">
          <label for="url">URL</label>
          <input id="url" type="text" class="form-control" v-model="data.url">
        </div>
        <div class="form-group full-width">
          <label for="geminiApiKey">Gemini API Key</label>
          <input id="geminiApiKey" type="password" class="form-control" v-model="data.apiKey" placeholder="Enter your Gemini API Key">
        </div>
      </div>

      <div class="button-group">
        <button class="btn btn-secondary" @click="ambilData()">
          Ambil Data Absen
        </button>
        <button class="btn btn-primary" v-if="data.absen.length > 0" @click="goToAnalyzePage()">
          Analisis dengan AI
        </button>
      </div>
    </details>

    <div class="table-section card" v-if="data.absen.length > 0">
      <div class="table-controls">
        <label for="hari">Tampilkan data untuk</label>
        <input id="hari" type="number" v-model="data.hari">
        <span>hari terakhir</span>
      </div>
      <small class="table-note">Keterangan: Hanya menampilkan 3 entri absen (pagi, sore, dan tanggal) per hari.</small>
      
      <div class="table-wrapper">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Data Absen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in data.absen" :key="i.nama">
              <td>{{ i.nama }}</td>
              <td>
                <div v-for="(j, index) in i.absen" :key="index">
                  <p v-if="index >= (i.absen.length - (data.hari * 3))">{{ j.join(' - ') }}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <LoadingBar v-if="data.loading"/>
  </div>
</template>


<script>
import { reactive, onMounted, watch } from 'vue';
import DataTable from 'datatables.net-vue3';
import axios from "axios";
import {dataAwal} from '../config/config';
import LoadingBar from '../components/LoadingBar.vue'
import { sharedState } from './store';
import { saveCredentials, loadCredentials } from './storage';
import { useRouter } from 'vue-router';

//pr menggabungkan dengan backendnyas
export default {
  name: "TheWelcome",
  components: {DataTable, LoadingBar},

  setup () {
const router = useRouter();
const data = reactive ({
  absen: [],
  absenTampil: [],
  hari: 1,
  loading: false,
  user: '',
  password: '',
  url: '',
  apiKey: ''
});

// Watch for changes in credentials and save them to localStorage
watch(() => ({
    user: data.user,
    password: data.password,
    url: data.url,
    apiKey: data.apiKey
}), (newCredentials) => {
    saveCredentials(newCredentials);
}, { deep: true });

onMounted(() => {
    const savedCredentials = loadCredentials();
    if (savedCredentials) {
        Object.assign(data, savedCredentials);
    }
});

function ambilData(){
  data.loading = true;
  const body = {
                    user: data.user,
                    password: data.password,
                    url: data.url
                }

            axios
                .post(
                    dataAwal.hostServer +"dataabsen1" , body
                )
                .then(function (response) {
                    if (!response) {
                        data.loading = true; // Corrected: was data2.data.loading
                    } else if (response.data.status == "sukses") {
                        data.absen = response.data.data;
                        data.loading = false;
                        console.log(data.absen);

                    } else {
                        data.loading = false; // Corrected: was data2.data.loading

                    }
                })
                .catch((error) => {
                    console.log(error);
                    data.loading = false; // Corrected: was data2.data.loading
                });
}

function goToAnalyzePage() {
  // Populate shared state for AnalyzeView using ONLY the filtered data
  sharedState.apiKey = data.apiKey;
  sharedState.rawAttendanceData = data.absen.map(student => {
    const filteredAbsen = student.absen.slice(-(data.hari * 3)); // Filter based on 'jumlah hari'
    const absenText = filteredAbsen
      .map(entry => entry.join(' - '))
      .join('\n');
    return `${student.nama}\n${absenText}`;
  }).join('\n\n');

  router.push('/analyze');
}

return {
  data,
  ambilData,
  goToAnalyzePage
}
  }}

</script>

<style scoped>
.welcome-container {
  display: flex;
  flex-direction: column;
  background: transparent;
  gap: 2rem;
}

.card {
  background: var(--color-background-soft);
  border-radius: 12px;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-border);
}

summary {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-heading);
  cursor: pointer;
  list-style: none; /* Remove default arrow */
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border-hover);
  margin-bottom: 1.5rem;
}

summary::-webkit-details-marker {
  display: none; /* Hide arrow in Chrome/Safari */
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1; /* Span across all columns */
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-text);
}

.button-group {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
}

.table-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.table-controls input[type="number"] {
  width: 80px;
}

.table-note {
  display: block;
  margin-bottom: 1.5rem;
  color: var(--vt-c-text-dark-2);
}

.table-wrapper {
  overflow-x: auto;
}

/* Force table text to respect the theme color for better contrast */
.table-wrapper .table, .table-wrapper .table td, .table-wrapper .table th {
  color: var(--color-text);
}

td p {
  margin-bottom: 0.25rem;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>