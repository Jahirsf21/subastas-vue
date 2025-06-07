<template>

</template>


<script setup>
import { reactive } from 'vue';
import { useSubastasStore } from '../stores/subastas';


const subastaStore = useSubastasStore();

const subasta = reactive ({
    titulo: "",
    descripcion: "",
    precioInicial: 0,
    raza: "",
    edad: "",
    peso: "",
    genetica: 0,
    certificaciones: Image,
    imagenes: Image,
    pujador: "",
    puja: 0,
    fechaInicio: "",
    fechaFinal: ""
})

const handleSubmit = () => {
    subastaStore.addSubastas({ ...subasta});
}

</script>

<style scoped></style>