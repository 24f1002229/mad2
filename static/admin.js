export default {
    template: `
    <div class="container-fluid">
        <h1> Parking Lots </h1>
        <div class="row">
            <div class="col" v-for="lot in lots" :key="lot.id">
                <div class="card" style="width: 18rem;">
                    <div class="card-body">
                        <h5 class="card-title"> {{lot.prime_location_name}} </h5>
                        <p> Address : {{lot.address}} </p>
                        <p> Price : {{lot.price}} </p>
                        <p> Pincode : {{lot.pincode}} </p>


                        <hr>

                        <h5> Parking Spots </h5>
                        <div class="d-flex flex wrap">
                            <div v-for="spot in lot.spots" :key="spot.id" 
                            class="text-white rounded m-1 d-flex justify-content-center align-items-center"
                            :class="spot.is_occupied ? 'bg-danger' : 'bg-success' "
                            style="width: 32px; height:32px; font-weight:bold; cursor:pointer;"
                            @click="">
                            {{spot.is_occupied ? "O" : "A" }}
                        </div>
                        </div>
                        <button @click="$router.push('/admin/edit-lot/' + lot.id)" class="card-link"> Edit lot </button>
                        <!--<button @click="#" class="card-link">Another link</button>-->
                    </div>
                </div>
            </div>
            <router-link to="/admin/add-lot" class="btn btn-warning"> AddLot Button </router-link> 
        </div>
    </div>
    `,
    data(){
        return {
            userData: {},
            lots : []
        }
    },
    mounted(){
        this.loadUser()
        this.loadData()
    },
    methods : {
        loadUser(){
            fetch('/api/admin', {
                headers : {"Authentication-Token" : localStorage.getItem("auth-token")}
            })
            .then(res => res.json())
            .then(data => {
                this.userData = [data];
            })
        },
        loadData(){
            fetch('/api/lots_with_spots',{
                headers : {
                    "Authentication-Token" : localStorage.getItem("auth-token")
                }
            })
            .then(res => res.json())
            .then(data => {
                this.lots = data.lots
            })
        }
    }
}