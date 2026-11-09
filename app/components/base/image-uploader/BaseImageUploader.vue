<template>
  <div class="flex flex-col  rounded-xl  bg-white w-full" :class="!profile ? 'border border-gray-300 overflow-hidden' : ''" dir="rtl">
    
    <!-- Header -->
    <div v-if="!profile" class="flex items-center justify-between px-4 py-3 bg-gray-100 border-b border-gray-200">
      <div class="text-sm font-semibold text-gray-700">
        {{ title }}
      </div>
      <div class="flex gap-2">
        <BaseBtn 
          color="gray" 
          class="!bg-white" 
          outline 
          text-color="black" 
          v-if="files.length > 0 || accessUrl" 
          @click.prevent="clearAll" 
        >
          {{ multiple ? 'پاک کردن همه' : 'پاک کردن' }}
        </BaseBtn>
        
        <BaseBtn 
          v-if="multiple || files.length === 0 || showChangeButton"
          color="gray" 
          class="!bg-white" 
          outline 
          text-color="black" 
          @click.prevent="triggerFileInput" 
        >
          {{ !multiple && (files.length  > 0 || accessUrl ) ? 'تغییر' : 'افزودن' }}
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        </BaseBtn>
      </div>
    </div>

    <!-- Hidden File Input -->
    <input 
      type="file" 
      ref="fileInput" 
      class="hidden" 
      :accept="accept" 
      :multiple="multiple && !crop && !profile" 
      @change="handleFileSelect" 
    />

    <!-- ================= PROFILE MODE ================= -->
    <div v-if="profile" class=" flex flex-col items-center justify-center py-6">

      <div 
        class="relative w-32 h-32 rounded-full overflow-visible border-4 border-white shadow-md group bg-gray-200 cursor-pointer"
        @click="triggerFileInput"
      >
      <div v-if="!files.length" class="p-1.5 border z-10 bg-white bottom-0 left-0 rounded-full w-8 h-8 absolute">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      </div>
        <img v-if="files.length > 0" :src="files[0]?.preview" class="w-full rounded-full h-full object-cover" />
        <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
          <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
        </div>
        
        <!-- Hover Overlay Profile -->
        <div class="absolute inset-0 bg-primary-500/20 opacity-0 rounded-full z-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="1.8" 
            stroke-linecap="round" 
            stroke-linejoin="round"
            class="w-8 h-8 text-white"
          >

            <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
            
            <!-- فلش بالا -->
            <path d="M12 3v12" />
            <path d="M7 8l5-5 5 5" />
          </svg>
        </div>
      </div>
      <div v-if="files.length > 0" class="mt-3">
        <BaseBtn color="red" size="sm" text-color="white" @click="clearAll">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="1.8" 
            stroke-linecap="round" 
            stroke-linejoin="round"
            class="w-4 h-4"
          >
            <path d="M3 6h18" />
            
            <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
            
            <path d="M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
            
            <path d="M10 11v6M14 11v6" />
          </svg>

          حذف تصویر
        </BaseBtn>

      </div>
    </div>

    <!-- ================= NORMAL MODE ================= -->
    <div 
      v-else
      class="relative transition-colors"
      :class="[
        isDragging ? 'bg-blue-50 border-2 border-dashed border-blue-400' : 'bg-white',
        (!multiple && files.length > 0) ? 'p-0' : 'p-4 min-h-[160px]'
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <!-- Empty State -->
      <div v-if="!accessUrl && files.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 py-8 cursor-pointer" @click="triggerFileInput">
        <svg class="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
        </svg>
        <p class="text-sm">تصاویر را اینجا رها کنید یا کلیک کنید</p>
      </div>

      <!-- File List (Multiple Mode) -->
      <div v-else-if="multiple && !crop" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div v-for="(file, index) in files" :key="index" class="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex flex-col">
          <div class="h-32 w-full bg-gray-200 relative overflow-hidden">
            <img :src="file.preview" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <BaseBtn color="gray" class="!bg-white" outline text-color="black" @click.prevent="removeFile(index)" >حذف</BaseBtn>
            </div>
          </div>
        </div>
      </div>

      <!-- Single File View -->
      <div v-else class="relative w-full h-64 group bg-gray-100">
        <img v-if="accessUrl" :src="accessUrl" class="w-full h-full" :class="crop ? 'object-contain' : 'object-contain'" />
        <img v-else :src="files[0]?.preview" class="w-full h-full" :class="crop ? 'object-contain' : 'object-contain'" />
        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <BaseBtn color="gray" class="!bg-white" outline text-color="black" @click.prevent="removeFile(0)">حذف</BaseBtn>
          
          <!-- <BaseBtn v-if="showChangeButton" color="gray" class="!bg-white" outline text-color="black" @click.prevent="triggerFileInput">تغییر</BaseBtn> -->
        </div>
      </div>

    </div>

    <!-- Crop Dialog -->
    <BaseDialog v-model="showCropDialog"     
      position="center"
      full-width
      full-height
      transitionShow="slide-up"
      transitionHide="slide-down"
      overflow="auto"
    >
      <div class="min-w-[400px] flex flex-col p-4 gap-3 bg-[#F9FAFA] h-full ">
        <div class="w-full h-[80vh] flex-1  relative  rounded">
          <img 
            ref="cropImageRef" 
            :src="tempCropImage" 
            class="block max-w-full max-h-full"
            crossorigin="anonymous"
            @load="initCropper"
          />
        </div>
        <div class="flex justify-end gap-2 mt-2">
          <BaseBtn color="gray" outline @click="cancelCrop">انصراف</BaseBtn>
          <BaseBtn color="blue" @click="confirmCrop">تایید و برش</BaseBtn>
        </div>
      </div>
    </BaseDialog>
    
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';
import BaseBtn from '@/components/base/button/BaseBtn.vue';
import BaseDialog from '@/components/base/dialog/BaseDialog.vue';
import Cropper from 'cropperjs';

interface PreviewFile {
  file?: File;
  preview: string;
  isExternal: boolean;
}

const props = defineProps({
  modelValue: {
    type: [Array, Object, String],
    default: () => []
  },
  title: { type: String, default: 'آپلود تصاویر' },
  accept: { type: String, default: 'image/*' },
  multiple: { type: Boolean, default: false },
  maxSize: { type: Number, default: 5 * 1024 * 1024 },
  showChangeButton: { type: Boolean, default: true }, 
  
  // Profile mode Props
  profile: { type: Boolean, default: false },

  // Crop Props
  crop: { type: Boolean, default: false },
  cropAspectRatio: { type: Number, default: 1 },
});

const emit = defineEmits(['update:modelValue', 'error', 'submitted' , 'deleted']);

const accessUrl = defineModel<string>('accessUrl')

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const files = ref<PreviewFile[]>([]);

// Crop State
const showCropDialog = ref(false);
const tempCropImage = ref('');

const cropImageRef = ref<HTMLImageElement | null>(null);
let cropperInstance: Cropper | null = null;
let originalFileRef: File | null = null;

watch(() => props.modelValue, (newVal) => {
  if (!newVal) { files.value = []; return; }
  const valArray = Array.isArray(newVal) ? newVal : [newVal];
  const newFiles: PreviewFile[] = [];

  valArray.forEach(item => {
    if (typeof item === 'string') {
      newFiles.push({ preview: item, isExternal: true });
    } else if (item instanceof File) {
      const existing = files.value.find(f => f.file === item);
      newFiles.push(existing ? existing : { file: item, preview: URL.createObjectURL(item), isExternal: false });
    }
  });
  files.value = newFiles;
}, { immediate: true });

const triggerFileInput = () => fileInput.value?.click();

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if(accessUrl.value) accessUrl.value = ''
  if (target.files && target.files.length > 0) processFiles(Array.from(target.files));
  if (fileInput.value) fileInput.value.value = '';
};

const handleDrop = (event: DragEvent) => {
  if (props.profile) return;
  isDragging.value = false;
  if (event.dataTransfer?.files) processFiles(Array.from(event.dataTransfer.files));
};

const isAccepted = (file: File) => {
  const rules = props.accept
    .split(',')
    .map(rule => rule.trim().toLowerCase())
    .filter(Boolean);

  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  return rules.some((rule) => {
    if (rule.startsWith('.')) return name.endsWith(rule);
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));

    return type === rule;
  });
};

const processFiles = (newFiles: File[]) => {
  const accepted: File[] = [];
  let hasInvalidType = false;
  let hasTooLarge = false;

  for (const file of newFiles) {
    if (!isAccepted(file)) hasInvalidType = true;
    else if (file.size > props.maxSize) hasTooLarge = true;
    else accepted.push(file);
  }

  // اگر حتی یک فایل رد شده باشد، یک پیام خطا می‌دهیم
  if (hasInvalidType) {
    emit('error', 'فقط تصاویر با فرمت مجاز پذیرفته می‌شوند.');
  }
  else if (hasTooLarge) {
    emit('error', 'حجم فایل زیاد است.');
  }

  const first = accepted[0];

  if (!first) return;

  // حالت برش و پروفایل: فقط یک فایل (اولین فایل معتبر)
  if (props.crop || props.profile) {
    originalFileRef = first;
    tempCropImage.value = URL.createObjectURL(first);
    showCropDialog.value = true;
    return;
  }

  const validFiles: PreviewFile[] = accepted.map(file => ({
    file,
    preview: URL.createObjectURL(file),
    isExternal: false,
  }));

  if (props.multiple) {
    files.value = [...files.value, ...validFiles];
  }
  else {
    clearInternalUrls();
    files.value = validFiles.slice(0, 1);
  }

  updateModel();
};

const initCropper = () => {
  if (cropperInstance) {
    cropperInstance.destroy();
    cropperInstance = null;
  }
  
  if (!cropImageRef.value || !tempCropImage.value) return;

  setTimeout(() => {
    if (!cropImageRef.value) return;
    
    cropperInstance = new Cropper(cropImageRef.value, {
      aspectRatio: props.profile ? 1 : props.cropAspectRatio,
      viewMode: 1,
      dragMode: 'crop',
      autoCropArea: 0.8,
      responsive: true,
      restore: true,
      checkCrossOrigin: false,
      modal: true,
      guides: true,
      center: true,
      highlight: true,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: true,
      ready: () => {
        console.log('Cropper initialized successfully');
      }
    });
  }, 50);
};

const confirmCrop = () => {
  if (!cropperInstance) {
    console.error('Cropper instance not found');
    return;
  }
  
  try {
    const canvas = cropperInstance.getCroppedCanvas({
      width: 800,
      height: props.profile ? 800 : Math.round(800 / props.cropAspectRatio),
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    });
    
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Failed to create blob from canvas');
        return;
      }
      
      const croppedFile = new File([blob], originalFileRef?.name || 'cropped.jpg', {
        type: blob.type,
        lastModified: Date.now()
      });

      clearInternalUrls();
      files.value = [{
        file: croppedFile,
        preview: URL.createObjectURL(croppedFile),
        isExternal: false
      }];
      
      updateModel();
      cancelCrop();

      emit('submitted', croppedFile); 

    }, originalFileRef?.type || 'image/jpeg', 0.95);

  } catch (error) {
    console.error('Error during cropping:', error);
    emit('error', 'خطا در برش تصویر');
  }
};
const cancelCrop = () => {
  showCropDialog.value = false;
  if (cropperInstance) {
    cropperInstance.destroy();
    cropperInstance = null;
  }
  if (tempCropImage.value) {
    URL.revokeObjectURL(tempCropImage.value);
    tempCropImage.value = '';
  }
  originalFileRef = null;
};

const removeFile = (index: number) => {
  if (accessUrl.value) {
    accessUrl.value = '';
    return;
  }

  const item = files.value[index];

  if (!item) return;

  if (!item.isExternal) URL.revokeObjectURL(item.preview);

  files.value.splice(index, 1);
  updateModel();
  emit('deleted');
};

const clearInternalUrls = () => {
  files.value.forEach(f => { if (!f.isExternal) URL.revokeObjectURL(f.preview); });
};

const clearAll = () => {
  if(!props.multiple) {
    removeFile(0)

    return
  }
  clearInternalUrls();
  files.value = [];
  updateModel();
  emit('deleted')
};

const updateModel = () => {
  const output = files.value.map(f => f.isExternal ? f.preview : f.file);
  emit('update:modelValue', props.multiple && !props.crop && !props.profile ? output : (output[0] || null));
};

onBeforeUnmount(() => {
  clearInternalUrls();
  if (cropperInstance) cropperInstance.destroy();
});
</script>
<style>
@import 'cropperjs/dist/cropper.css';
</style>