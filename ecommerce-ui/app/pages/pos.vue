<template>
  <v-container>
    <v-app-bar color="primary">
      <v-container>
        <v-app-bar-title class="font-weight-bold">Online Grocery</v-app-bar-title>
      </v-container>
    </v-app-bar>

    <v-row class="mb-6">
      <v-col cols="12" md="8">
        <h1 class="text-h4 font-weight-bold mb-2">
          Products
        </h1>
        <p class="text-grey-darken-1">
          Browse products, add to cart, and checkout.
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="3" v-for="item in products" :key="item">
        <v-card rounded="lg">
          <v-img color="surface-variant" height="150" src="https://placehold.co/600x400?text=Product" cover>
          </v-img>
          <v-card-title class="mt-3">
            {{ item.name }}
          </v-card-title>
          <v-card-text>
            <div class="text-h3 font-weight-bold">
              ₱1000
            </div>
          </v-card-text>
          <v-card-actions class="my-2">
            <v-btn color="primary" variant="flat" block><v-icon start>mdi-cart-outline</v-icon> Order Item</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-navigation-drawer location="right" v-model="cartDrawer" temporary>

    </v-navigation-drawer>

    <v-fab icon location="right bottom">

    </v-fab>

  </v-container>
</template>

<script setup>
const config = useRuntimeConfig()
const products = ref([])
const cartDrawer = ref(true)

const fetchProduct = async () => {
  try {
    const response = await $fetch('/api/products', {
      baseURL: config.public.strapiUrl
    })
    console.log(response.data)

    products.value = response.data
  } catch (err) {
    console.log(err)
  }

}

onMounted(() => {
  fetchProduct()
})
</script>

<style></style>