<template>
  <details>
    <summary> Ambil data absen </summary>
  <div class="mb-3">
    <label for="exampleInputEmail1" class="form-label">User</label>
    <input type="text" class="form-control" v-model="data.user">
      </div>
  <div class="mb-3">
    <label for="exampleInputPassword1" class="form-label">Password</label>
    <input type="password" class="form-control" v-model="data.password">
  </div>
  <div class="mb-3">
    <label for="exampleInputEmail1" class="form-label">URL</label>
    <input type="text" class="form-control" v-model="data.url">
      </div>


<button class="btn btn-secondary"
@click="ambilData()">
  get data absen</button>

    
  </details>

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
<LoadingBar v-if="data.loading"/>
</template>


<script>
import { reactive } from 'vue';
import datajson from '../data/absen.json';
import DataTable from 'datatables.net-vue3';
import axios from "axios";
import {dataAwal} from '../config/config';
import LoadingBar from '../components/LoadingBar.vue'

//pr menggabungkan dengan backendnyas
export default {
  name: "TheWelcome",
  components: {DataTable, LoadingBar},

  setup () {
const data = reactive ({
  absen: [],
  absenTampil: [],
  hari: 1,
  loading: false,
  user: '',
  password: '',
  url: ''
})
function ambilData(){
  data.loading = true;
  const body = {
                    user: data.user,
                    password: data.password,
                    url: data.url
                }

            axios
                .post(
                    dataAwal.hostServer +"dataabsen" , body
                )
                .then(function (response) {
                    if (!response) {
                        data2.data.loading = true;
                    } else if (response.data.status == "sukses") {
                        data.absen = response.data.data;
                        data.loading = false;
                        console.log(data.absen);

                    } else {
                        data2.data.loading = false;

                    }
                })
                .catch((error) => {
                    console.log(error);
                    data2.data.lihat = true;
                    data2.data.loading = false;
                });
}

return {
  data,
  ambilData
}
  }}

</script>