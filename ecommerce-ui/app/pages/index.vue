<template>
  <div>
    <!-- Header -->
    <v-row class="mb-5">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold">Product Catalog</h1>

        <p>Browse vegetables and place your order.</p>
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
        <v-card elevation="3" rounded="lg">
          <!-- Product Image -->
          <v-img
            :src="getProductImage(product)"
            height="220"
            cover
            @click="openImage(product)"
          />

          <!-- Product Details -->
          <v-card-title>
            {{ product.name }}
          </v-card-title>

          <v-card-subtitle> ₱ {{ product.price }} </v-card-subtitle>

          <v-card-text>
            <div class="mb-2">
              Unit:
              {{ product.unit }}
            </div>

            <div>
              {{ product.description }}
            </div>
          </v-card-text>

          <!-- Quantity -->
          <div class="px-4">
            <v-text-field
              v-model="product.qty"
              label="Quantity"
              type="number"
              variant="outlined"
              density="comfortable"
            />
          </div>

          <!-- Total -->
          <div class="px-4 pb-2">
            <strong> Total: ₱ {{ computeTotal(product) }} </strong>
          </div>

          <!-- Actions -->
          <v-card-actions>
            <v-btn block color="success" @click="openOrder(product)">
              Order Item
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- IMAGE PREVIEW -->
    <v-dialog v-model="imageDialog" max-width="700">
      <v-card>
        <v-img :src="selectedImage" height="600" contain />

        <v-card-actions>
          <v-spacer />

          <v-btn color="red" @click="imageDialog = false"> Close </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ORDER MODAL -->
    <v-dialog v-model="orderDialog" max-width="500">
      <v-card>
        <!-- Title -->
        <v-card-title class="font-weight-bold"> Order Product </v-card-title>

        <!-- Product Image -->
        <v-img
          v-if="selectedProduct"
          :src="getProductImage(selectedProduct)"
          height="600"
          contain
        />

        <!-- Product Details -->
        <v-card-text>
          <div v-if="selectedProduct" class="mb-4">
            <div class="text-h6 font-weight-bold">
              {{ selectedProduct.name }}
            </div>

            <div class="text-subtitle-1">₱ {{ selectedProduct.price }}</div>

            <div class="text-body-2">Unit: {{ selectedProduct.unit }}</div>
            <div class="text-body-2">
              Description: {{ selectedProduct.description }}
            </div>
          </div>

          <!-- Buyer Name -->
          <v-text-field
            v-model="customer_name"
            label="Buyer Name"
            variant="outlined"
          />

          <!-- Mobile Number -->
          <v-text-field
            v-model="mobile_number"
            label="Mobile Number"
            type="number"
            variant="outlined"
          />

          <!-- Quantity -->
          <v-text-field
            v-model="order_qty"
            label="Quantity"
            type="number"
            variant="outlined"
          />

          <!-- Auto Computed Price -->
          <v-text-field
            :model-value="'₱ ' + orderTotal"
            label="Total Price"
            readonly
            variant="outlined"
          />
        </v-card-text>

        <!-- Buttons -->
        <v-card-actions>
          <v-spacer />

          <v-btn color="red" variant="text" @click="orderDialog = false">
            Cancel
          </v-btn>

          <v-btn color="success" @click="submitOrder"> Submit Order </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
const products = ref([]);

const imageDialog = ref(false);
const selectedImage = ref("");

const orderDialog = ref(false);

const selectedProduct = ref(null);

const customer_name = ref("");
const mobile_number = ref("");
const order_qty = ref(1);

const orderTotal = computed(() => {
  if (!selectedProduct.value) return 0;

  return Number(selectedProduct.value.price) * Number(order_qty.value);
});

const fetchProducts = async () => {
  try {
    const response = await $fetch(
      "http://localhost:1337/api/products?populate=*",
    );

    products.value = response.data.map((item) => ({
      ...item,
      qty: 1,
    }));
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

const computeTotal = (product) => {
  return Number(product.price) * Number(product.qty || 1);
};

const openImage = (product) => {
  selectedImage.value = `http://localhost:1337${product.image.url}`;

  imageDialog.value = true;
};

const openOrder = (product) => {
  selectedProduct.value = product;

  order_qty.value = product.qty || 1;

  orderDialog.value = true;
};

const submitOrder = async () => {
  if (!customer_name.value) {
    alert("Buyer name is required");
    return;
  }

  if (!mobile_number.value) {
    alert("Mobile number is required");
    return;
  }

  try {
    await $fetch("http://localhost:1337/api/orders", {
      method: "POST",

      body: {
        data: {
          buyer_name: customer_name.value,
          mobile_number: mobile_number.value,
          quantity: order_qty.value,
          total_price: orderTotal.value,
          product_name: selectedProduct.value.name,
        },
      },
    });

    alert("Order submitted successfully!");

    customer_name.value = "";
    mobile_number.value = "";
    order_qty.value = 1;

    orderDialog.value = false;
  } catch (error) {
    console.log(error);

    alert("Unable to submit order");
  }
};

onMounted(() => {
  fetchProducts();
});
</script>
