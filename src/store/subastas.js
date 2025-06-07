import { defineStore } from "pinia";
import { ref } from "vue";

export const useSubastasStore = defineStore("subastas", ()=>{
    const subastas = ref([])
    const addSubastas = (subasta) => subastas.value.push(subasta)
    const getSubasta = (subastaTitle) => {
        return subastas.value.find((subastas) => subastas.titulo === subastaTitle)
    }
    return {subastas, addSubastas, getSubasta}
}, {persist: true});