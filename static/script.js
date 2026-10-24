import home from './home.js'
import login from './login.js'
import register from './register.js'
import AdminNavbar from './admin_navbar.js'
import UserNavbar from './user_navbar.js'


const routes = [
    {path: '/', component:home},
    {path:'/login', component:login},
    {path:'/register', component:register},
    {path:'/admin_navbar', component:AdminNavbar},
    {path:'/user_navbar', component:UserNavbar}
]


const router = new VueRouter({
    routes
})

const app = new Vue({
    el : "#app",
    router,
    template:`
    <div class="container">

        <!---Admin Navbar-->
        <admin-navbar v-if="$route.path.startsWith('/admin')"> </admin-navbar>

        <!----User Navbar--->
        <user-navbar v-if="$route.path.startsWith('/user')"> </user-navbar>

        <router-view :loggedIn = 'loggedIn' @login="handlelogin"> </router-view>
    </div>
    `,
    data : {
        loggedIn : !!localStorage.getItem("auth-token")
    },
    components : {
        "admin-navbar" : AdminNavbar,
        "user-navbar" : UserNavbar
    },
    methods: {
        handlelogin(){
            this.loggedIn = true
        },
        handlelogout(){
            this.loggedIn = false
            localStorage.clear();
            this.$router.push('/');
        }
    }

})