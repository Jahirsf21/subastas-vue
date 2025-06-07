<template>
     <h2 v-if="!subasta">La subasta no existe</h2>
    <div v-else>
        <h2>Title: {{ subasta.title}}</h2>
        <h3>Description: {{ subasta.description}}</h3>
        <h3>precioInicial: {{ subasta.precioInicial}}</h3>
        <h3>raza: {{ subasta.raza}}</h3>
        <h3>edad: {{ subasta.edad}}</h3>
        <h3>peso: {{ subasta.peso}}</h3>
        <h3>genetica: {{ subasta.genetica}}</h3>
        <h3>certificaciones: {{ subasta.certificaciones}}</h3>
        <h3>imagenes: {{ subasta.imagenes}}</h3>
        <h3>pujador: {{ subasta.pujador}}</h3>
        <h3>puja: {{ subasta.puja}}</h3>
        <h3>fechaInicio: {{ subasta.fechaInicio}}</h3>
        <h3>fechaFinal: {{ subasta.fechaFinal}}</h3>
    </div>
</template>


<script setup>
import { useRoute } from "vue-router";
import { watch } from "vue";
import { useSubastasStore } from "../store/subastas";
const route = useRoute();
const subastasStore = useSubastasStore();

let subasta = subastasStore.getSubasta(subastaTitulo) ;
let subastaTitulo = route.params.movieTitulo;

watch (()=>{
    route.params.subastaTitulo,
    () => {
        subastaTitulo = route.params.subastaTitulo;
        subasta = subastasStore.getSubasta(subastaTitulo);
    }
})

</script>


<style scoped></style>