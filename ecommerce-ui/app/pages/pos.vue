<template>
  <v-container>
    <v-app-bar color="primary">
      <v-container>
        <v-app-bar-title class="font-weight-bold">Online Grocery</v-app-bar-title>
      </v-container>
    </v-app-bar>

    <v-row class="mb-6">
      <v-col cols="12" md="10">
        <h1 class="text-h4 font-weight-bold mb-2">
          Products
        </h1>
        <p class="text-grey-darken-1">
          Browse products, add to cart, and checkout.
        </p>
      </v-col>
      <v-col col="12" md="2" class="align-self-center text-right">
        <v-btn color="primary" size="large" @click="productDialog = true">
          Create Product
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="6" md="3" sm="3" v-for="item in products" :key="item">
        <v-card rounded="lg">
          <!-- <v-img color="surface-variant" height="150" :src="item?.image?.url" cover>
          </v-img> -->
          <v-img :src="getProductImage(item)" height="180" cover @click="openImage(item.image)" />
          <!-- <v-card-title class="mt-3">
            {{ item.name }}
          </v-card-title> -->
          <v-card-text>
            <div class="text-h2 font-weight-bold">
              {{ item.name }}
            </div>
            <div class="text-h3 ">
              ₱{{ item.price }}
            </div>
          </v-card-text>
          <v-card-actions class="my-2">
            <v-btn color="primary" variant="flat" @click="addToCart(item)" block><v-icon start>mdi-cart-outline</v-icon>
              Add to Cart</v-btn>
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
                <v-btn size="x-small" icon="mdi-delete" color="error" variant="text"
                  @click="removeFromCart(item.documentId)" />
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


    <!-- CREATE PRODUCT DIALOG -->
    <v-dialog v-model="productDialog" max-width="600">
      <v-card rounded="xl">
        <v-card-title class="font-weight-bold">
          Create Product
        </v-card-title>

        <v-card-text>
          <v-text-field v-model="productForm.name" label="Product Name" variant="outlined" />

          <v-textarea v-model="productForm.description" label="Description" variant="outlined" rows="3" />

          <v-text-field v-model.number="productForm.price" label="Price" type="number" variant="outlined" />

          <v-text-field v-model.number="productForm.stock" label="Stock" type="number" variant="outlined" />

          <v-text-field v-model="productForm.category" label="Category" variant="outlined" />

          <v-file-input v-model="productForm.image" label="Product Image" accept="image/*" prepend-icon="mdi-camera"
            variant="outlined" />
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn variant="text" @click="productDialog = false">
            Cancel
          </v-btn>

          <v-btn color="primary" :loading="productLoading" @click="createProduct">
            Save Product
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

     <!-- IMAGE PREVIEW DIALOG -->
    <v-dialog v-model="dialog" max-width="800">
      <v-card>
        <v-img
          :src="selectedImage"
          max-height="700"
          contain
        />

        <v-card-actions>
          <v-spacer />
          <v-btn color="red" @click="dialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script lang="ts" setup>
//@ts-nocheck
const config = useRuntimeConfig()
const products = ref<Product>([])
const cart = ref<CartItem>([])
const cartDrawer = ref(false)
const productDialog = ref(false)
const productLoading = ref(false)
const dialog = ref(false)
const selectedImage = ref('')

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

const productForm = reactive({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  category: '',
  image: null as File | null
})

const resetProductForm = () => {
  productForm.name = ''
  productForm.description = ''
  productForm.price = 0
  productForm.stock = 0
  productForm.category = ''
  productForm.image = null
}

const openImage = (image) => {
  selectedImage.value = `http://localhost:1337${image.url}`
  console.log("Image: ", selectedImage.value)
  dialog.value = true
}

// Compute Total Cart Value
const cartTotal = computed(() => {
  return cart.value.reduce((total, item) => {
    return total + Number(item.price) * item.quantity
  }, 0)
})

// Get Product Image
const getProductImage = (product: Product) => {
  const imageUrl = product.image?.url
  console.log
  if (imageUrl) {
    return `${config.public.strapiUrl}${imageUrl}`
  }
  return 'https://placehold.co/600x400?text=Product'
}

// Remove from cart
const removeFromCart = (documentId: string) => {
  cart.value = cart.value.filter((item) => item.documentId !== documentId)
}

// Fetch Products
const fetchProducts = async () => {
  try {
    const response = await $fetch('/api/products', {
      baseURL: config.public.strapiUrl,
      query: {
        populate: '*'
      }
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


// Create Product
const createProduct = async () => {
  if (!productForm.name) {
    showMessage('Product name is required.', 'error')
    return
  }

  if (!productForm.price || productForm.price <= 0) {
    showMessage('Valid price is required.', 'error')
    return
  }

  productLoading.value = true

  try {
    let imageId = null

    if (productForm.image) {
      const formData = new FormData()
      formData.append('files', productForm.image)

      const uploadResponse: any = await $fetch('/api/upload', {
        baseURL: config.public.strapiUrl,
        method: 'POST',
        body: formData
      })

      imageId = uploadResponse?.[0]?.id
    }

    await $fetch('/api/products', {
      baseURL: config.public.strapiUrl,
      method: 'POST',
      body: {
        data: {
          name: productForm.name,
          description: productForm.description,
          price: productForm.price,
          stock: productForm.stock,
          category: productForm.category,
          is_active: true,
          image: imageId
        }
      }
    })

    alert('Product created successfully.')
    productDialog.value = false
    console.log("Fetch Product")
    resetProductForm()
    await fetchProducts()
  } catch (error) {
    alert('Unable to create product.')
  } finally {
    productLoading.value = false
  }
}

// Submit Order
const submitOrder = () => {
  cart.value = []
  cartDrawer.value = false

}

onMounted(() => {
  fetchProducts()
})
</script>

<style></style>