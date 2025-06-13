<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="form-container">
      <header class="form-header">
        <h1>{{ isRanchProfile ? t('createAuction.titleRanch') : t('createAuction.titlePersonal') }}</h1>
        <button @click="$emit('close')" class="back-button" :aria-label="t('createAuction.goBack')">
          <img src="/icons/regresar.svg" alt="Regresar">
        </button>
      </header>

      <form @submit.prevent="handleSubmit" class="auction-form">
        <div class="left-panel">
          <label class="image-uploader">
            <img src="/icons/image.svg" alt="Subir imagen" class="placeholder-icon">
            <span>{{ t('createAuction.imagePlaceholder') }}</span>
            <input type="file" multiple @change="handleImageUpload" hidden>
          </label>
        </div>

        <div class="right-panel">
          <!-- Campo de Título añadido -->
          <div class="form-group full-width"><label>{{ t('createAuction.title') }}</label><input type="text" v-model="formData.titulo"></div>

          <div class="form-grid">
            <div class="form-group"><label>{{ t('createAuction.breed') }}</label><input type="text" v-model="formData.raza"></div>
            <div class="form-group"><label>{{ t('createAuction.gender') }}</label>
              <select v-model="formData.genero">
                <option value="Macho">{{ t('createAuction.genderOptions.male') }}</option>
                <option value="Hembra">{{ t('createAuction.genderOptions.female') }}</option>
              </select>
            </div>
            <!-- Cambiado v-model de 'tipo' a 'categoria' -->
            <div class="form-group"><label>{{ t('createAuction.type') }}</label>
              <select v-model="formData.categoria"> 
                <option value="Ternero">{{ t('createAuction.typeOptions.calf') }}</option>
                <option value="Novilla">{{ t('createAuction.typeOptions.heifer') }}</option>
                <option value="Toro">{{ t('createAuction.typeOptions.bull') }}</option>
                <option value="Vaca">{{ t('createAuction.typeOptions.cow') }}</option>
              </select>
            </div>
            <div class="form-group"><label>{{ t('createAuction.age') }}</label><input type="text" v-model="formData.edad"></div>
            <div class="form-group"><label>{{ t('createAuction.weight') }}</label><input type="text" v-model="formData.peso"></div>
            <div class="form-group"><label>{{ t('createAuction.geneticsPercentage') }}</label><input type="text" v-model="formData.genetica"></div>
            <div class="form-group"><label>{{ t('createAuction.vaccinations') }}</label><input type="text" v-model="formData.vacunaciones"></div>
            
            <template v-if="isRanchProfile">
              <div class="form-group"><label>{{ t('createAuction.lotNumber') }}</label><input type="text" v-model="formData.lote"></div>
              <div class="form-group"><label>{{ t('createAuction.birthDate') }}</label><input type="date" v-model="formData.fechaNacimiento"></div>
              <div class="form-group"><label>{{ t('createAuction.farmNumber') }}</label><input type="text" v-model="formData.finca"></div>
              <div class="form-group"><label>{{ t('createAuction.brandCode') }}</label><input type="text" v-model="formData.fierro"></div>
            </template>
          </div>
          
          <div class="form-group full-width"><label>{{ t('createAuction.description') }}</label><input type="text" v-model="formData.descripcion"></div>

          <div class="footer-grid">
            <div class="form-group"><label>{{ t('createAuction.basePrice') }}</label><input type="number" v-model="formData.precioInicial"></div>
            <div class="form-group"><label>{{ t('createAuction.deadline') }}</label><input type="datetime-local" v-model="formData.fechaFinal"></div>
            <button type="submit" class="submit-button">{{ t('createAuction.submit') }}</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { useSubastasStore } from '../../store/subastas'
import { useAuthStore } from '../../store/auth';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';

const emit = defineEmits(['close']);
const { t } = useI18n();
const subastasStore = useSubastasStore();
const authStore = useAuthStore();

const isRanchProfile = computed(() => authStore.activeProfile === 'Ganaderia');

// Modelo de datos del formulario, ahora con 'titulo' y 'categoria'
const formData = reactive({
  titulo: '',
  raza: '',
  genero: '',
  categoria: '', 
  edad: '',
  peso: '',
  genetica: '',
  vacunaciones: '',
  descripcion: '',
  precioInicial: null,
  fechaFinal: '',
  imagenes: [],
  lote: '',
  fechaNacimiento: '',
  finca: '',
  fierro: '',
});

const handleImageUpload = (event) => {
  formData.imagenes = [...event.target.files];
};

const handleSubmit = async () => {
  // Objeto de configuración para SweetAlert
  const swalConfig = {
    willOpen: () => {
      const container = Swal.getContainer();
      if (container) {
        // Asegura que el SweetAlert tenga un z-index superior al del modal
        container.style.zIndex = '4000'; 
      }
    }
  };
  
  const activeProfileData = authStore.activeProfileData;
  if (!activeProfileData) {
    console.error("No hay un perfil activo.");
    return;
  }
  
  const vendedorInfo = {
    tipo: authStore.activeProfile,
    nombre: activeProfileData.nombre || activeProfileData.nombreCompleto,
    logo: activeProfileData.logo || '/logo-predeterminado.png' 
  };

  const auctionPayload = {
    ...formData,
    vendedor: vendedorInfo,
    estado: "Nuevo",
    imagenes: ["/img/placeholder.jpg"],
    pujador: null,
    puja: null,
    ...(isRanchProfile.value && {
      numeroLote: formData.lote,
      fechaNacimientoAnimal: formData.fechaNacimiento,
      numeroFinca: formData.finca,
      codigoFierro: formData.fierro,
    }),
  };

  try {
    await subastasStore.addAuction(auctionPayload);
    Swal.fire({
      ...swalConfig, // Aplicamos la configuración
      icon: 'success',
      title: t('createAuction.successTitle'),
      text: t('createAuction.successText'),
      timer: 2000,
      showConfirmButton: false,
    });
    emit('close');
  } catch (error) {
    Swal.fire({
      ...swalConfig, // Aplicamos la configuración también en el error
      icon: 'error',
      title: t('createAuction.errorTitle'),
      text: t('createAuction.errorText'),
    });
  }
};
</script>

<style scoped>
/* Estilos sin cambios, se mantienen igual */
.modal-overlay { position: fixed; inset: 0; background-color: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 3000; backdrop-filter: blur(5px); }
.form-container { background-color: #F9F6F2; padding: 2rem; border-radius: 16px; width: 90%; max-width: 900px; max-height: 90vh; overflow-y: auto; position: relative; }
.form-header { display: flex; justify-content: center; align-items: center; margin-bottom: 2rem; position: relative; }
.form-header h1 { font-family: 'Merriweather', serif; font-size: 1.8rem; color: #3E2723; margin: 0; }
.back-button { position: absolute; right: 0; background: none; border: none; cursor: pointer; }
.back-button img { width: 28px; height: 28px; }
.auction-form { display: flex; gap: 2rem; }
.left-panel, .right-panel { display: flex; flex-direction: column; }
.left-panel { flex: 0 0 200px; }
.right-panel { flex: 1; }
.image-uploader { width: 200px; height: 200px; border: 2px dashed #A1887F; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; color: #5D4037; text-align: center; }
.placeholder-icon { width: 80px; height: 80px; margin-bottom: 0.5rem; }
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem 1.5rem; margin-bottom: 1rem; }
.form-group { display: flex; flex-direction: column; }
.form-group label { font-size: 0.9rem; color: #5D4037; margin-bottom: 0.3rem; font-weight: 600; }
.form-group input, .form-group select { padding: 0.6rem; border: 1px solid #D7CCC8; border-radius: 6px; background-color: #EAE3E0; font-size: 0.95rem; }
.full-width { grid-column: 1 / -1; }
.footer-grid { display: grid; grid-template-columns: 1fr 1fr auto; gap: 1.5rem; align-items: flex-end; margin-top: 1rem; }
.submit-button { padding: 0.6rem 2rem; background-color: #A85B2C; color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: bold; cursor: pointer; align-self: flex-end; }
</style>