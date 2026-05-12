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
              ₱{{ item.price }}
            </div>
          </v-card-text>
          <v-card-actions class="my-2">
            <v-btn color="primary" variant="flat" @click="addToCart(item)" block><v-icon start>mdi-cart-outline</v-icon>
              Order
              Item</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-navigation-drawer location="right" width="420" v-model="cartDrawer" temporary>
      <v-toolbar>
        <v-toolbar-title>My Cart</v-toolbar-title>
        <v-btn @click="cartDrawer = false" icon="mdi-close"></v-btn>
      </v-toolbar>
      <div class="pa-4">
        <v-alert v-if="!cart.length" color="warning" type="info" variant="tonal">
          Your cart is empty
        </v-alert>
        <template v-else>
          <v-list>
            <v-list-item v-for="item in cart" :key="item.documentId" class="border rounded-lg mb-2">
              <v-list-item-title>{{ item.name }}</v-list-item-title>
              <v-list-item-subtitle>
                ₱{{ item.price }} x {{ item.quantity }}
              </v-list-item-subtitle>
              <template #append>
                <v-btn size="x-small" icon="mdi-delete" color="error" variant="text" @click="removeFromCart(item.documentId)" />
              </template>
            </v-list-item>

          </v-list>

          <v-divider class="my-4"></v-divider>

          <div class="d-flex justify-space-between text-h6 font-weight-bold mb-4">
            <span>Total</span>
            <span>₱{{ cartTotal }}</span>
          </div>


          <v-text-field label="Customer Name" variant="outlined" density="comfortable"></v-text-field>
          <v-text-field label="Email" variant="outlined" density="comfortable"></v-text-field>
          <v-text-field label="Phone" variant="outlined" density="comfortable"></v-text-field>
          <v-textarea label="Address" variant="outlined" rows="2"></v-textarea>
          <v-btn color="success" @click="submitOrder" block>Checkout</v-btn>


        </template>
      </div>
    </v-navigation-drawer>

    <v-fab app="fixed" location="right bottom" class="mr-2" icon="mdi-cart" color="primary" @click="cartDrawer = true">

    </v-fab>

  </v-container>
</template>

<script lang="ts" setup>
//@ts-nocheck
const config = useRuntimeConfig()
const products = ref<Product>([])
const cart = ref<CartItem>([])
const cartDrawer = ref(false)

type Product = {
  documentId: string,
  name: string,
  description: string,
  price: number,
  stock: number,
  category: string,
  image: any

}

type CartItem = Product & {
  quantity: number
}

// Compute Total Cart Value
const cartTotal = computed(() => {
  return cart.value.reduce((total, item) => {
    return total + Number(item.price) * item.quantity
  }, 0)
})

// Remove from cart
const removeFromCart = (documentId: string) => {
  cart.value = cart.value.filter((item) => item.documentId !== documentId)
}

// Fetch Products
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

// Add to cart function
const addToCart = (product: Product) => {

  const existingItem = cart.value.find(
    (item) => item.documentId === product.documentId
  )

  if (existingItem) {
    existingItem.quantity++
  } else {
    cart.value.push({
      ...product,
      quantity: 1
    })
  }
  alert("Product added to cart")
}

// Submit Order
const submitOrder = () => {
  cart.value = []
  cartDrawer.value = false

}

onMounted(() => {
  fetchProduct()
})
</script>

<style></style>