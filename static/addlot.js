export default {
    template: `
        <div class="container-fluid">
            <h1> Add New Parking Lot </h1>
            <label for="prime_location_name" class="form-label">Prime Location name</label>
            <select class="form-select" v-model="form.prime_location_name" @change="setPincode" aria-label="Default select example">
                <option v-for="loc in locations" :value="loc.name"> {{loc.name}} </option>
            </select>
            <div class="mb-3">
                <label for="address" class="form-label">Address</label>
                <input type="address" class="form-control" id="address" v-model="form.address">
            </div>
            <div class="mb-3">
                <label for="Pincode" class="form-label">Pincode</label>
                <input type="pincode" class="form-control" id="Pincode" v-model="form.pincode" >
            </div>
            <div class="mb-3">
                <label for="price" class="form-label"> Price </label>
                <input type="number" class="form-control" id="price" v-model="form.price" >
            </div>
            <div class="mb-3">
                <label for="number_of_spots" class="form-label">Number of Spots</label>
                <input type="number" class="form-control" id="number_of_spots" v-model="form.number_of_spots" >
            </div>
            <button @click="addLot" class="btn btn-primary"> Add Lot </button>
        </div>
    `,
    data(){
        return {
            locations : [
                {name: "Mathura", pincode:"123456"},
                {name: "Delhi", pincode: "123456"}
            ],
            form: {
                prime_location_name: "",
                address: "",
                pincode: "",
                price: "",
                number_of_spots:""
            }
        }
    },
    methods : {
        setPincode(){
            let loc = this.locations.find(x => x.name === this.form.prime_location_name);
            this.form.pincode = loc ? loc.pincode: "";
        },
        addLot(){
        fetch('/api/add_lot',{
            method: "POST",
            headers : {
                "Content-Type" : "application/json",
                "Authentication-Token" : localStorage.getItem("auth-token")
            },
            body : JSON.stringify(this.form)
        })
        .then(res => res.json())
        .then(() => {
            this.$router.push('/admin')
            alert("parking lot is created !!")
        })
    }
    },
    
}