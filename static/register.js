export default {
    template : `
        <div>
            <h1> Register Page </h1>
            <p> {{message}} </p>
            <div class="mb-3">
                <label for="email" class="form-label">Email address</label>
                <input type="email" class="form-control" id="email" v-model="formData.email" placeholder="name@example.com">
            </div>
            <div class="mb-3">
                <label for="name" class="form-label">Username</label>
                <input type="String" class="form-control" id="name" v-model="formData.username" >
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" v-model="formData.password" >
            </div>
            <button @click="addUser" class="btn btn-danger">Submit</button>
        </div>
    `,
    data : function(){
        return {
            formData: {
                email: "",
                username: "",
                password: "",
            },
            message: " "
        }
    },
    methods : {
        addUser : function(){
            fetch('/api/register',{
                method: "POST",
                headers : {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify(this.formData)
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message)
                this.$router.push('/login')
                this.message = data.message
            } )
        }
    }
}