import home from './home.js'
import login from './login.js'
import register from './register.js'
import AdminNavbar from './admin_navbar.js'
import UserNavbar from './user_navbar.js'
import admin from './admin.js'
import addlot from './addlot.js'
import editlot from './editlot.js'
import user from './user.js'
import bookreservation from './bookreservation.js'
import search from './search.js'

const routes = [
    {path: '/', component:home},
    {path:'/login', component:login},
    {path:'/register', component:register},
    {path:'/admin_navbar', component:AdminNavbar},
    {path:'/user_navbar', component:UserNavbar},
    {path:'/admin', component:admin},
    {path:'/admin/add-lot', component:addlot},
    {path:'/admin/edit-lot/:id', component:editlot},
    {path:'/user', component:user},
    {path:'/user/book-spot/:lot_id', component:bookreservation, props:true},
    {path:'/admin/search/user/:id', component:search},
    {path:'/admin/search/lot/:location', component:search}
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