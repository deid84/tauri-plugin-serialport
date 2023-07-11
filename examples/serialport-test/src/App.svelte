<script lang="ts">
  import { Serialport } from 'tauri-plugin-serialport-api';

  let serialport: Serialport | undefined = undefined;
  let name: string;

  function openPort() {
    serialport = new Serialport({ portName: name, baudRate: 9600 });
    serialport
      .open()
      .then((res) => {
        console.log('open serialport', res);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  function closePort() {
    serialport
      .close()
      .then((res) => {
        console.log('close serialport', res);
      })
      .catch((err) => {
        console.error(err);
      });
  }
  
  function available_ports() {
    Serialport.available_ports()
      .then((res) => {
        console.log('available_ports: ', res);
      })
      .catch((err) => {
        console.error(err);
      });
  }
</script>

<main class="container">
  <h1>Welcome to Tauri Serial Port Plugin!</h1>

  <div class="row">
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo vite" alt="Vite Logo" />
    </a>
    <a href="https://tauri.app" target="_blank">
      <img src="/tauri.svg" class="logo tauri" alt="Tauri Logo" />
    </a>
    <a href="https://svelte.dev" target="_blank">
      <img src="/svelte.svg" class="logo svelte" alt="Svelte Logo" />
    </a>
  </div>

  <p>
    Click on the Tauri, Vite, and Svelte logos to learn more.
  </p>

  <div class="row">
    <button on:click={available_ports}>Scan Ports</button>
  </div>

  <div class="row">
    <button on:click={openPort}>Connect</button>
    <input type="text" placeholder="write your com port here..." bind:value={name} />
    <button on:click={closePort}>Disconnect</button>
  </div>


</main>

<style>
  .logo.vite:hover {
    filter: drop-shadow(0 0 2em #747bff);
  }

  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00);
  }
</style>