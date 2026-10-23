export default {
    props: ['loggedIn'],
    template : `
        <div>
            <h1> Login Page </h1>
            <p> {{message}} </p>
            <div class="mb-3">
                <label for="email" class="form-label">Email address</label>
                <input type="email" class="form-control" id="email" v-model="formData.email" placeholder="name@example.com">
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" v-model="formData.password" >
            </div>
            <button @click="loginUser" class="btn btn-danger">Submit</button>
        </div>
    `,
    data : function(){
        return {
            formData: {
                email: "",
                password: "",
            },
            message: " "
        }
    },
    methods : {
        loginUser : function(){
            fetch('/api/login',{
                method: "POST",
                headers : {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify(this.formData)
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                if (Object.keys(data).includes("auth-token")){
                    localStorage.setItem("auth-token", data["auth-token"])
                    localStorage.setItem("id", data.id)
                    localStorage.setItem("username", data.username)
                    this.$emit('login')
                    if (data.roles.includes('admin')){
                        this.$router.push('/admin')
                    }
                    else{
                        this.$router.push('/user')
                    }
                }
                else {
                    this.message = data.message
                }
            } )
        }
    }
}