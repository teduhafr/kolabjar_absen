<template>

 jumlah hari: <input type="number" v-model="data.hari">
 <br> <small> keterangan: hanya mengambil 3 absen terakhir per hari</small>
<table  class="table table table-striped">
  <thead >
    <tr >
      <th><b>Nama</b></th>
<th><b>Data Absen</b></th>
    </tr>

  </thead>
  <tbody >
    <tr v-for="i in data.absen" :key="i" ><td>  {{i.nama}}</td>
    <td > <div v-for="(j, index) in i.absen" :key="j">
      <p v-if="index >= (i.absen.length - (data.hari*3))"> {{j[0]}} - {{j[1]}} - {{j[2]}}</p></div>
    </td></tr>
  
</tbody>
</table >
</template>


<script>
import { reactive } from 'vue';
import datajson from '../data/absen.json';
import DataTable from 'datatables.net-vue3';
//pr menggabungkan dengan backendnyas
export default {
  name: "TheWelcome",
  components: {DataTable},

  setup () {
const data = reactive ({
  absen: datajson,
  hari: 1
})

return {
  data
}
  }}

</script>