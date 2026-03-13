<script setup>
import { reactive, ref } from "vue"
import axios from "axios"

const user = reactive({
  lastname: "",
  firstname: "",
  classname: "",
  email: "",
  team: ""
})

const registered = ref(false)

const registerUser = async () => {
  if (!user.lastname.trim() || !user.firstname.trim() || !user.classname.trim() || !user.email.trim() || !user.team.trim()) {
    alert("Tous les champs sont requis.")
    return
  }

  try {
    // 1️⃣ Créer l'équipe si elle n'existe pas
    await axios.post("/api/teams", { name: user.team })

    // 2️⃣ Créer le chef d'équipe (user) attaché à l'équipe
    await axios.post("/api/users", {
      lastname: user.lastname,
      firstname: user.firstname,
      classname: user.classname,
      email: user.email,
      team: user.team
    })

    registered.value = true
    alert(`Compte créé ! Bienvenue dans l'équipe ${user.team}.`)

  } catch (e) {
    console.error(e)
    alert("Erreur lors de l'inscription.")
  }
}
</script>

<template>
  <div class="container">
    <h2>Inscription Chef d'Équipe</h2>

    <div class="form">
      <input v-model="user.lastname" placeholder="Nom" />
      <input v-model="user.firstname" placeholder="Prénom" />
      <input v-model="user.classname" placeholder="Classe" />
      <input v-model="user.email" placeholder="Email" />
      <input v-model="user.team" placeholder="Nom de votre équipe" />

      <button @click="registerUser">Créer mon compte</button>

      <template v-if="registered">
        <p>Compte créé avec succès ! Votre équipe : <strong>{{ user.team }}</strong></p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 500px;
  margin: auto;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
input {
  padding: 8px;
}
button {
  background: purple;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
}
</style>
