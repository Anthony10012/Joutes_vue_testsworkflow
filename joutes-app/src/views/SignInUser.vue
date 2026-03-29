<script setup>
import { reactive, ref } from "vue"
import axios from "axios"

// Reactive object to store form input
const user = reactive({
  firstname: "",
  lastname: "",
  classname: "",
  email: "",
  team: "",
  sport: "",
  password: ""
})

// Track registration status and loading state
const registered = ref(false)
const loading = ref(false)

// List of available sports
const sports = ["Football", "Basket", "Tennis", "Natation"]

// Function to handle user registration
const registerUser = async () => {
  // Basic validation
  if (
    !user.firstname.trim() ||
    !user.lastname.trim() ||
    !user.classname.trim() ||
    !user.email.trim() ||
    !user.team.trim() ||
    !user.sport.trim() ||
    !user.password.trim()
  ) {
    alert("All fields are required.")
    return
  }

  if (!user.email.includes("@")) {
    alert("Invalid email")
    return
  }

  loading.value = true

  try {
    // 1. Check if the team already exists
    let teamId
    const teamsRes = await axios.get("/api/teams")
    const existingTeam = teamsRes.data.find(t => t.Name === user.team)

    if (existingTeam) {
      teamId = existingTeam.idTeams
    } else {
      const createTeamRes = await axios.post("/api/teams", { Name: user.team })
      teamId = createTeamRes.data.idTeams
    }

    // 2. Create the player
    const playerRes = await axios.post("/api/players", {
      Firstname: user.firstname,
      Lastname: user.lastname,
      Email: user.email,
      Classname: user.classname,
      Teams_id: teamId
    })

    const playerId = playerRes.data.id

    // 3. Create the user linked to the player
    const username = user.email
    await axios.post("/api/users", {
      username,
      password: user.password,
      role: "leader",
      players_id: playerId
    })

    registered.value = true
    alert(`Account created successfully! Welcome to team ${user.team}.`)

    // Reset form
    Object.keys(user).forEach(key => user[key] = "")

  } catch (e) {
    console.error(e)
    alert("Error during registration.")
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-container">
    <div class="register-card">

      <h1>Team Leader Registration</h1>
      <p class="subtitle">Create your team and start registering</p>

      <div class="form-group">
        <label>Last Name</label>
        <input v-model="user.lastname" placeholder="Your last name" />
      </div>

      <div class="form-group">
        <label>First Name</label>
        <input v-model="user.firstname" placeholder="Your first name" />
      </div>

      <div class="form-group">
        <label>Class</label>
        <input v-model="user.classname" placeholder="Ex: 3A" />
      </div>

      <div class="form-group">
        <label>Email</label>
        <input v-model="user.email" placeholder="your.email@example.com" />
      </div>

      <div class="form-group">
        <label>Password</label>
        <input type="password" v-model="user.password" placeholder="Password" />
      </div>

      <div class="form-group">
        <label>Team Name</label>
        <input v-model="user.team" placeholder="Your team name" />
      </div>

      <div class="form-group">
        <label>Sport Choice</label>
        <select v-model="user.sport">
          <option disabled value="">Select a sport</option>
          <option v-for="s in sports" :key="s" :value="s">
            {{ s }}
          </option>
        </select>
      </div>

      <button
        class="register-btn"
        @click="registerUser"
        :disabled="loading"
      >
        {{ loading ? "Loading..." : "Create Account" }}
      </button>

      <div v-if="registered" class="success-box">
        Account created successfully! Team: <strong>{{ user.team }}</strong>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Keep the original styling */
.register-container {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f3f4f6;
}

.register-card {
  width: 450px;
  padding: 40px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

h1 { text-align: center; margin-bottom: 5px; }
.subtitle { text-align: center; color: #6b7280; margin-bottom: 30px; }

.form-group { display: flex; flex-direction: column; margin-bottom: 15px; }
label { margin-bottom: 5px; font-weight: 500; }
input, select { padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; }
input:focus, select:focus { outline: none; border-color: #2563eb; }

.register-btn {
  width: 100%; background: #2563eb; color: white; border: none; padding: 14px;
  border-radius: 8px; font-size: 16px; cursor: pointer; margin-top: 10px;
}

.register-btn:hover { background: #1e4fd1; }
.register-btn:disabled { background: #93c5fd; cursor: not-allowed; }

.success-box {
  margin-top: 20px; padding: 12px; background: #dcfce7;
  border-radius: 8px; text-align: center; color: #166534;
}
</style>
