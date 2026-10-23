import home from './home.js'
import login from './login.js'


const routes = [
    {path: '/', component:home},
    {path:'/login', component:login}
]


const router = new VueRouter({
    routes
})

const app = new Vue({
    el : "#app",
    router,
    template:`
    <div class="container">
        <router-view :loggedIn = 'loggedIn' @login="handlelogin"> </router-view>
    </div>
    `,
    data : {
        loggedIn : !!localStorage.getItem("auth-token")
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