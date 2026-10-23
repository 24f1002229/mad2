export default {
    template: `
        <div>
            <h1 style="text-align: center; color:red;" > Vehicle Parking System </h1>
            <h3 style="text-align: center;" > This is a Vehicle Parking System help in parking your car at any place with security.</h3>
            <div>
                <router-link v-if="!loggedIn" class="btn btn-warning" to="/login"> Login </router-link>
                <router-link v-if="!loggedIn" class="btn btn-success" to="/register"> Register </router-link>
        </div>
    `
}