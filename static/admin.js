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
                                @click="openSpotMenu(spot)">
                                {{spot.is_occupied ? "O" : "A" }}
                            </div>
                        </div>

                        <div class="modal" id="spotModal" tabindex="-1">
                            <div class="modal-dialog">
                                <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title"> spot #{{selectedSpot.id}} </h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <p> <b> Status </b> 
                                        <span :class="selectedSpot.is_occupied ? 'text-danger' : 'text-success' ">
                                            {{selectedSpot.is_occupied ? "Occupied" : "Available" }}
                                        </span>
                                    </p>
                                    <div v-if="selectedSpot.is_occupied && selectedSpot.reservation">
                                        <p> <b> Vehicle Number : </b> {{selectedSpot.reservation.vehicle_number}} </p>
                                        <p> <b> User Id : </b> {{selectedSpot.reservation.customer_id}} </p>
                                        <p> <b> Parking Time : </b> {{new Date(selectedSpot.reservation.start_time) .toLocaleString() }} </p>
                                        <p> <b> Parking_cost : </b> {{selectedSpot.reservation.parking_cost}} </p>
                                    </div>
                                    <div v-if="!selectedSpot.is_occupied">
                                        <p class="text-success"> Spot is Available!! </p>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    <button type="button" class="btn btn-primary" :disabled="selectedSpot.is_occupied" @click="removeSpot(selectedSpot.id)"> Delete Spot </button>
                                </div>
                                </div>
                            </div>
                            </div>
                        <button @click="$router.push('/admin/edit-lot/' + lot.id)" class="btn btn-info"> Edit lot </button>
                        <button @click="deleteLot(lot.id)" class="btn btn-danger"> Delete </button>
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
            lots : [],
            selectedSpot: {}
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
        },
        deleteLot(id){
            fetch(`/api/delete_lots/${id}`,{
                method: "DELETE",
                headers : {"Authentication-Token" : localStorage.getItem("auth-token")}
            })
            .then(res => res.json())
            .then(data => {
                this.loadData();
                alert(data.message);
            })
        },
        openSpotMenu(spot){
            fetch(`/api/spot/${spot.id}`,{
                headers : {"Authentication-Token" : localStorage.getItem("auth-token")}
            })
            .then(res => res.json())
            .then(data => {
                this.selectedSpot = data;
                new bootstrap.Modal(document.getElementById("spotModal")).show();
            })
        },
        openSpot(id){
            fetch(`/api/spot/${spot.id}`,{
                headers : {"Authorization-Token" : localStorage.getItem("auth-token")}
            })
            .then(res => res.json())
            .then(data => {
                this.selectedSpot = data;
                this.showModal = true;
            })
        },
        removeSpot(id){
            fetch(`/api/delete_spots/${id}`,{
                method: "DELETE",
                headers : {"Authentication-Token" : localStorage.getItem("auth-token")}
            })
            .then(res => res.json())
            .then(data => {
                this.loadData();
                alert(data.message);
            })
        }
    }
}