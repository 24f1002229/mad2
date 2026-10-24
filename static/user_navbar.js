export default {
    name: "UserNavbar",
    template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item"><router-link to="/user" class="nav-link active"> Home </router-link> </li>
                <li class="nav-item"> <router-link to="/" class="nav-link active"> Logout </router-link>  </li>
            </ul>
            <form class="d-flex">
                <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
                <button class="btn btn-outline-success" type="submit">Search</button>
            </form>
            </div>
            <div class="navbar-text"><b> Welcome "{{uname}}" </b> </div>
        </div>
    </nav>
    `,
    data(){
        return {
            uname : localStorage.getItem("username") || "",   
        }
    }
}