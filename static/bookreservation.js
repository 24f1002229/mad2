export default {
    props: ['lot_id'],
    template: `
        <div class="container-fluid">
            <h1> Book Parking Spot </h1>
                <div class="mb-3">
                    <label class="form-label">Vehicle Number</label>
                    <input type="string" class="form-control" v-model="vehicle_number" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Parking Start Time</label>
                    <input type="datetime-local" class="form-control" v-model="start_time" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Leaving Time </label>
                    <input type="datetime-local" class="form-control" v-model="end_time" required >
                </div>
                <div class="mb-3">
                    <label class="form-label"> Remarks </label>
                    <input type="string" class="form-control" v-model="remarks" >
                </div>
            <button @click="SubmitReservation" class="btn btn-primary"> Book Spot </button>
        </div>
    `,
    data(){
        return {
            vehicle_number: "",
            start_time: "",
            end_time: "",
            remarks: "",
            cost_per_hour : 0,
            user_id : localStorage.getItem("user_id"),
            spot_id: null
        }
    },
    mounted(){
        if(!this.lot_id){
            console.error("lot id is missing")
            return;
        }
        fetch(`/api/lot_first_available_spot/${this.lot_id}`, {
                headers : {"Authentication-Token" : localStorage.getItem("auth-token")}
            })
            .then(res => res.json())
            .then(data => {
                this.spot_id = data.spot_id;
            })
    },
    methods : {
        SubmitReservation(){
            if(!this.spot_id){
                alert("Spot is not available");
                return;
            }

            fetch(`/api/book_spot/${this.spot_id}`,{
                method: "POST",
                headers : {
                    "Content-Type" : "application/json",
                    "Authentication-Token" : localStorage.getItem("auth-token")
                },
                body: JSON.stringify({
                    vehicle_number: this.vehicle_number,
                    start_time: this.start_time,
                    end_time: this.end_time,
                    remarks: this.remarks,
                    cost_per_hour : this.cost_per_hour,
                    user_id : this.user_id,
                    lot_id: this.lot_id
                })
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message)
                this.$router.push('/user')
            })
    }
    },
    
}