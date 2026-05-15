<template>
  <div>
    <!-- Header -->
    <v-row class="mb-5">
      <v-col cols="12" md="8">
        <h1 class="text-h4 font-weight-bold">Product Management</h1>

        <p>Add and manage products.</p>
      </v-col>

      <v-col cols="12" md="4" class="text-md-right">
        <v-btn color="primary" @click="dialog = true"> Add Product </v-btn>
      </v-col>
    </v-row>

    <!-- Products -->
    <v-row>
      <v-col
        v-for="product in products"
        :key="product.id"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card elevation="3">
          <v-img :src="getProductImage(product)" height="220" cover />

          <v-card-title>
            {{ product.name }}
          </v-card-title>

          <v-card-subtitle> ₱ {{ product.price }} </v-card-subtitle>

          <v-card-text>
            <div>
              Unit:
              {{ product.unit }}
            </div>

            <div>
              {{ product.description }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ADD PRODUCT DIALOG -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title> Add Product </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="name"
            label="Product Name"
            variant="outlined"
          />

          <v-text-field
            v-model="price"
            label="Price"
            type="number"
            variant="outlined"
          />

          <v-text-field
            v-model="unit"
            label="Unit"
            placeholder="kg / piece / pack"
            variant="outlined"
          />

          <v-textarea
            v-model="description"
            label="Description"
            variant="outlined"
          />

          <v-file-input
            v-model="image"
            label="Product Image"
            accept="image/*"
            variant="outlined"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn color="red" variant="text" @click="dialog = false">
            Cancel
          </v-btn>

          <v-btn color="success" @click="createProduct"> Save Product </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
const products = ref([]);

const dialog = ref(false);

const name = ref("");
const price = ref(0);
const unit = ref("");
const description = ref("");
const image = ref(null);

const fetchProducts = async () => {
  try {
    const response = await $fetch(
      "http://localhost:1337/api/products?populate=*",
    );

    products.value = response.data;
  } catch (error) {
    console.log(error);
  }
};

const getProductImage = (product) => {
  if (product.image?.url) {
    return `http://localhost:1337${product.image.url}`;
  }

  return "https://placehold.co/600x400?text=No+Image";
};

const createProduct = async () => {
  try {
    let imageId = null;

    // Upload image
    if (image.value) {
      const formData = new FormData();

      formData.append("files", image.value);

      const uploadResponse = await $fetch("http://localhost:1337/api/upload", {
        method: "POST",
        body: formData,
      });

      imageId = uploadResponse[0].id;
    }

    // Save Product
    await $fetch("http://localhost:1337/api/products", {
      method: "POST",

      body: {
        data: {
          name: name.value,
          price: price.value,
          unit: unit.value,
          description: description.value,
          image: imageId,
        },
      },
    });

    alert("Product added successfully!");

    dialog.value = false;

    name.value = "";
    price.value = 0;
    unit.value = "";
    description.value = "";
    image.value = null;

    fetchProducts();
  } catch (error) {
    console.log(error);

    alert("Unable to save product");
  }
};

onMounted(() => {
  fetchProducts();
});
</script>
