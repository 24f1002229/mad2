export default {
    template : `
       <div class="container-fluid">
            <div v-for="r in reservations" :key="r.id" class="card" style="width: 18rem;">
                <div class="card-body">
                    <h5 class="card-title"> Reservation #{{r.id}} 
                        <span class="badge" :class="r.parking_ended ? 'bg-danger' : 'bg-success' ">
                            {{r.parking_ended ? "Expired" : "Active" }}
                        </span>
                    </h5>

                    <p class="card-text"> <b> Parking Lot : </b> {{r.lot_name}} </p>
                    <p class="card-text"> <b> Assigned Spot : </b> {{r.spot_number}} </p>
                    <p class="card-text"> <b> Vehicle number : </b> {{r.vehicle_number}} </p>
                    <p class="card-text"> <b> Start Time : </b> {{r.start_time}} </p>
                    <p class="card-text"> <b> End Time : </b> {{r.end_time}} </p>
                    <p class="card-text" v-if="r.parking_cost != null " > <b> Parking Cost : </b> {{r.parking_cost.tofixed(2)}} </p>
                    <button v-if="!r.parking_started" class="btn btn-warning" @click="parkVehicle(r.id)"> Park Vehicle </button>
                    <button v-else-if="r.parking_started && !r.parking_ended" class="btn btn-danger" @click="releaseVehicle(r.id)"> Release Vehicle </button>
                </div>
            </div>

            <div class="col">
                <h3> Available Parking Lots </h3>
                <div v-if="lots.length===0" class="alert alert-warning"> No Available Lot </div>
                <div v-for="l in lots" :key="l.id" class="card">
                    <div class="card-body>">
                        <h5 class="card-title"> {{l.prime_location_name}}  </h5>
                        <p class="card-text"> <b> Available Spots : </b> {{l.available_spots}} </p>
                        <button class="btn btn-success" @click="$router.push('/user/book-spot/' + l.id)" :disabled="l.available_spots === 0"> Reserve Spot</button>
                    </div>
                </div>
            </div>

        </div>
    `,
    data(){
        return {
            userData : {},
            reservations : {},
            lots : []
        }
    },
    methods : {
        loadUser(){
            fetch('/api/home', {
                headers : {
                    "Content-Type" : "application/json",
                    "Authentication-Token" : localStorage.getItem("auth-token")
                }
            })
            .then(res => res.json())
            .then(data => {
                this.userData = [data];
            })
        },
        loadReservations(){
            fetch('/api/user/reservations',{
                headers : {
                    "Content-Type" : "application/json",
                    "Authentication-Token" : localStorage.getItem("auth-token")
                }
            })
            .then(res => res.json())
            .then(data => {
                this.reservations = data.map(r =>({
                    id : r.id,
                    vehicle_number : r.vehicle_number,
                    lot_name : r.lot_name,
                    spot_number : r.spot.id,
                    parking_started : r.parking_started,
                    parking_ended : r.parking_ended,
                    start_time : r.start_time ? new Date (r.start_time + "Z").toLocaleString() : "N/A",
                    end_time : r.end_time ? new Date (r.start_time + "Z").toLocaleString() : "N/A",
                    parking_cost : r.parking_cost || null,
                    active : !r.parking_ended
                }) )
            })
        },
        loadLots(){
            fetch("/api/parking/lots", {
                headers : {
                    "Content-Type" : "application/json",
                    "Authentication-Token" : localStorage.getItem("auth-token")
                }
            })
            .then(res => res.json())
            .then(data => {
                this.lots = data.map(l => ({
                    ...l,
                    available_spots : l.spots.filter(s => !s.is_occupied).length
                }))
            })
        },
        parkVehicle(reservation_id){
            fetch(`/api/occupy_spot/${reservation_id}`, {
                method : "PUT",
                headers : {
                    "Content-Type" : "application/json",
                    "Authentication-Token" : localStorage.getItem("auth-token")
                }
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                this.loadReservations();
                this.loadLots()
            })
        },
        releaseVehicle(reservation_id){
            fetch(`/api/free_spot/${reservation_id}`, {
                method : "PUT",
                headers : {
                    "Content-Type" : "application/json",
                    "Authentication-Token" : localStorage.getItem("auth-token")
                }
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                const res = this.reservations.find(r => r.id === reservation_id);
                if (res){
                    res.parking_ended = true;
                    res.end_time = new Date().toLocaleString();
                    res.parking_cost = data.parking_cost
                } 
                this.loadReservations();
                this.loadLots()
            })
        }
    }
}