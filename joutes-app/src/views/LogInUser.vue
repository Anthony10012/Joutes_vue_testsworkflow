<template>
  <div class="login-container">
    <div class="login-card">

      <h1>Gestion des Équipes Sportives</h1>
      <p class="subtitle">Connectez-vous pour continuer</p>

      <div class="form-group">
        <label>Username</label>
        <input
          type="text"
          placeholder="username"
          v-model="username"
        />
      </div>

      <div class="form-group">
        <label>Mot de passe</label>
        <input
          type="password"
          placeholder="********"
          v-model="password"
        />
      </div>

      <button class="login-btn" @click="login" :disabled="loading">
        {{ loading ? "Connexion..." : "Se connecter" }}
      </button>

    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import axios from "axios"

const username = ref("")
const password = ref("")
const loading = ref(false)

const login = async () => {
  if (!username.value || !password.value) {
    alert("Tous les champs sont obligatoires")
    return
  }

  loading.value = true

  try {
    const res = await axios.post("http://localhost:3006/api/auth/login", {
      username: username.value,
      password: password.value
    })

    console.log("Réponse backend:", res.data)

    // Stocker le token JWT
    localStorage.setItem("token", res.data.token)

    alert(`Connexion réussie ! Bienvenue ${res.data.user.username}`)

    // Optionnel : redirection vers une autre page après login
    // window.location.href = "/dashboard"

  } catch (e) {
    console.error(e)
    alert(e.response?.data?.message || "Erreur de connexion")
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  width: 420px;
  padding: 40px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

h1 {
  font-size: 28px;
  margin-bottom: 5px;
}

.subtitle {
  color: #6b7280;
  margin-bottom: 30px;
}

.form-group {
  text-align: left;
  margin-bottom: 20px;
}

label {
  font-weight: 500;
  display: block;
  margin-bottom: 6px;
}

input {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
}

input:focus {
  outline: none;
  border-color: #2563eb;
}

.login-btn {
  width: 100%;
  background: #2563eb;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

.login-btn:hover {
  background: #1e4fd1;
}

.login-btn:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}
</style>
