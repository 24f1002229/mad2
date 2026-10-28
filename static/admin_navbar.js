export default {
    name: "AdminNavbar",
    template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item"><router-link to="/admin" class="nav-link active"> Home </router-link> </li>
                <li class="nav-item"> <router-link to="/" class="nav-link active"> Logout </router-link>  </li>
            </ul>
            <form class="d-flex" role="search">
                <input class="form-control me-2" type="search" v-model="searchText" placeholder="Search" aria-label="Search">
                <button class="btn btn-outline-success" type="submit" @click="performSearch" > Search </button>
            </form>
            </div>
            <div class="navbar-text"><b> Welcome "{{uname}}" </b> </div>
        </div>
    </nav>
    `,
    data(){
        return {
            uname : localStorage.getItem("username") || "",   
            searchText: ""
        }
    },
    methods: {
        performSearch(){
            if(!this.searchText){
                alert("Please write something")
                return;
            }
            if(!isNaN(this.searchText)){
                this.$router.push(`/admin/search/user/${this.searchText}`)
                return;
            }

            this.$router.push(`/admin/search/lot/${this.searchText}`)
        }
    }
}