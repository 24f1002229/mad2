export default {
    template: `
        <div class="container-fluid">
            <h1> Edit Parking Lot </h1>
            <div class="card" style="width: 18rem;">
                <div class="card-body">
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
                        <label for="number_of_spots" class="form-label">Add Number of Spots</label>
                        <input type="number" class="form-control" id="number_of_spots" v-model="form.add_spots" min="0">
                    </div>
                    <button @click="updateLot" class="btn btn-primary"> Update Lot </button>
                </div>
            </div>
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
                add_spots:0
            }
        }
    },
    mounted(){
        this.loadlotData()
    },
    methods : {
        setPincode(){
            let loc = this.locations.find(x => x.name === this.form.prime_location_name);
            this.form.pincode = loc ? loc.pincode: "";
        },
        loadlotData(){
            fetch(`/api/lot/${this.lotId}`,{
                method: "GET",
                headers : {
                    "Authentication-Token" : localStorage.getItem("auth-token")
                },
            })
            .then(res => res.json())
            .then(data => {
                this.form.prime_location_name = data.prime_location_name;
                this.form.address = data.address;
                this.form.price = data.price;
                this.form.pincode = data.pincode;
            })
        },
        updateLot(){
            fetch(`/api/update_lot/${this.lotId}`,{
                method: "PUT",
                headers : {
                    "Content-Type" : "application/json",
                    "Authentication-Token" : localStorage.getItem("auth-token")
                },
                body : JSON.stringify(this.form)
            })
            .then(res => res.json())
            .then(() => {
                this.$router.push('/admin')
                alert("parking lot is updated successfully !!")
            })
        }
    },
    
}