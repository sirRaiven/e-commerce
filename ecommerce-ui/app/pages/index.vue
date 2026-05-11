<template>
  <div>
    <v-app-bar color="primary" elevation="2">
      <v-container class="d-flex align-center">
        <v-app-bar-title class="font-weight-bold">
          Simple E-Commerce
        </v-app-bar-title>

        <v-spacer />

        <v-btn variant="tonal" @click="cartDrawer = true">
          Cart
          <v-badge v-if="cart.length" :content="cart.length" color="error" inline />
        </v-btn>
      </v-container>
    </v-app-bar>
    <v-container class="py-8">
      <v-row class="mb-6">
        <v-col cols="12" md="8">
          <h1 class="text-h4 font-weight-bold mb-2">
            Products
          </h1>
          <p class="text-grey-darken-1">
            Browse products, add to cart, and checkout.
          </p>
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field v-model="search" label="Search product" prepend-inner-icon="mdi-magnify" variant="outlined"
            density="comfortable" hide-details />
        </v-col>
      </v-row>

      <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
        {{ errorMessage }}
      </v-alert>

      <v-row v-if="loading">
        <v-col v-for="n in 4" :key="n" cols="12" sm="6" md="3">
          <v-skeleton-loader type="card" />
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col v-for="product in filteredProducts" :key="product.documentId" cols="12" sm="6" md="3">
          <v-card class="h-100" rounded="xl" elevation="3">
            <v-img :src="getProductImage(product)" height="180" cover />

            <v-card-title>
              {{ product.name }}
            </v-card-title>

            <v-card-subtitle>
              {{ product.category || 'General' }}
            </v-card-subtitle>

            <v-card-text>
              <p class="text-body-2 mb-3">
                {{ product.description || 'No description available.' }}
              </p>

              <div class="text-h6 font-weight-bold">
                ₱{{ formatCurrency(product.price) }}
              </div>

              <div class="text-caption text-grey">
                Stock: {{ product.stock }}
              </div>
            </v-card-text>

            <v-card-actions>
              <v-btn block color="primary" :disabled="product.stock <= 0" @click="addToCart(product)">
                Add to Cart
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>


    <v-navigation-drawer v-model="cartDrawer" location="right" width="420" temporary>
      <v-toolbar color="primary">
        <v-toolbar-title>My Cart</v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-close" @click="cartDrawer = false" />
      </v-toolbar>

      <div class="pa-4">
        <v-alert v-if="!cart.length" type="info" variant="tonal">
          Your cart is empty.
        </v-alert>

        <template v-else>
          <v-list>
            <v-list-item v-for="item in cart" :key="item.documentId" class="border rounded-lg mb-2">
              <v-list-item-title class="font-weight-bold">
                {{ item.name }}
              </v-list-item-title>

              <v-list-item-subtitle>
                ₱{{ formatCurrency(item.price) }} × {{ item.quantity }}
              </v-list-item-subtitle>

              <template #append>
                <div class="d-flex align-center ga-1">
                  <v-btn size="small" icon="mdi-minus" variant="tonal" @click="decreaseQty(item.documentId)" />

                  <v-btn size="small" icon="mdi-plus" variant="tonal" @click="increaseQty(item.documentId)" />

                  <v-btn size="small" icon="mdi-delete" color="error" variant="tonal"
                    @click="removeFromCart(item.documentId)" />
                </div>
              </template>
            </v-list-item>
          </v-list>

          <v-divider class="my-4" />

          <div class="d-flex justify-space-between text-h6 font-weight-bold mb-4">
            <span>Total</span>
            <span>₱{{ formatCurrency(cartTotal) }}</span>
          </div>

          <v-text-field v-model="checkout.customer_name" label="Customer Name" variant="outlined"
            density="comfortable" />

          <v-text-field v-model="checkout.customer_email" label="Email" variant="outlined" density="comfortable" />

          <v-text-field v-model="checkout.customer_phone" label="Phone" variant="outlined" density="comfortable" />

          <v-textarea v-model="checkout.address" label="Address" variant="outlined" rows="3" />

          <v-btn block color="success" size="large" :loading="checkoutLoading" @click="submitOrder">
            Checkout
          </v-btn>
        </template>
      </div>
    </v-navigation-drawer>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
//@ts-nocheck
type Product = {
  documentId: string
  name: string
  description?: string
  price: number
  stock: number
  category?: string
  image?: any
}

type CartItem = Product & {
  quantity: number
}

const config = useRuntimeConfig()

const products = ref<Product[]>([])
const cart = ref<CartItem[]>([])
const loading = ref(false)
const checkoutLoading = ref(false)
const errorMessage = ref('')
const search = ref('')
const cartDrawer = ref(false)

const checkout = reactive({
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  address: ''
})

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success'
})

const filteredProducts = computed(() => {
  if (!search.value) return products.value

  return products.value.filter((product) =>
    product.name.toLowerCase().includes(search.value.toLowerCase())
  )
})

const cartTotal = computed(() => {
  return cart.value.reduce((total, item) => {
    return total + Number(item.price) * item.quantity
  }, 0)
})

const formatCurrency = (value: number) => {
  return Number(value || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const showMessage = (message: string, color = 'success') => {
  snackbar.message = message
  snackbar.color = color
  snackbar.show = true
}

const getProductImage = (product: Product) => {
  const imageUrl = product.image?.url

  if (imageUrl) {
    return `${config.public.strapiUrl}${imageUrl}`
  }

  return 'https://placehold.co/600x400?text=Product'
}

const fetchProducts = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response: any = await $fetch('/api/products', {
      baseURL: config.public.strapiUrl,
      query: {
        populate: '*',
        'filters[is_active][$eq]': true,
        'sort[0]': 'createdAt:desc'
      }
    })

    products.value = response.data || []
  } catch (error) {
    errorMessage.value = 'Unable to load products. Please check your Strapi server.'
  } finally {
    loading.value = false
  }
}

const addToCart = (product: Product) => {
  const existingItem = cart.value.find(
    (item) => item.documentId === product.documentId
  )

  if (existingItem) {
    if (existingItem.quantity >= product.stock) {
      showMessage('Not enough stock available.', 'error')
      return
    }

    existingItem.quantity++
  } else {
    cart.value.push({
      ...product,
      quantity: 1
    })
  }

  showMessage('Product added to cart.')
}

const increaseQty = (documentId: string) => {
  const item = cart.value.find((cartItem) => cartItem.documentId === documentId)

  if (!item) return

  if (item.quantity >= item.stock) {
    showMessage('Not enough stock available.', 'error')
    return
  }

  item.quantity++
}

const decreaseQty = (documentId: string) => {
  const item = cart.value.find((cartItem) => cartItem.documentId === documentId)

  if (!item) return

  if (item.quantity <= 1) {
    removeFromCart(documentId)
  } else {
    item.quantity--
  }
}

const removeFromCart = (documentId: string) => {
  cart.value = cart.value.filter((item) => item.documentId !== documentId)
}

const validateCheckout = () => {
  if (!checkout.customer_name) return 'Customer name is required.'
  if (!checkout.customer_email) return 'Customer email is required.'
  if (!checkout.customer_phone) return 'Customer phone is required.'
  if (!checkout.address) return 'Address is required.'
  if (!cart.value.length) return 'Cart is empty.'

  return ''
}

const submitOrder = async () => {
  const validationError = validateCheckout()

  if (validationError) {
    showMessage(validationError, 'error')
    return
  }

  checkoutLoading.value = true

  try {
    await $fetch('/api/orders', {
      baseURL: config.public.strapiUrl,
      method: 'POST',
      body: {
        data: {
          customer_name: checkout.customer_name,
          customer_email: checkout.customer_email,
          customer_phone: checkout.customer_phone,
          address: checkout.address,
          items: cart.value.map((item) => ({
            product_document_id: item.documentId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            subtotal: Number(item.price) * item.quantity
          })),
          total_amount: cartTotal.value,
          order_status: 'Pending'
        }
      }
    })

    cart.value = []
    checkout.customer_name = ''
    checkout.customer_email = ''
    checkout.customer_phone = ''
    checkout.address = ''
    cartDrawer.value = false

    showMessage('Order submitted successfully.')
  } catch (error) {
    showMessage('Unable to submit order.', 'error')
  } finally {
    checkoutLoading.value = false
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<style>
html {
  background: #f5f5f5;
}

.border {
  border: 1px solid #e0e0e0;
}
</style>