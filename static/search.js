export default {
    template : `
    <div class="container-fluid">
        <h3> Search Results </h3>
        <hr>
        <div v-if="user">
            <h4> User Results </h4>
            <div class="card" style="width: 18rem;">
                <p> <b> Id : </b> {{user.id}} </p>
                <p> <b> Email :</b> {{user.email}} </p>
                <p> <b> Username : </b> {{user.username}} </p>
            </div>
        </div>
        <div v-if="lots.length">
            <h4> Parking lots </h4>
            <div v-for="lot in lots" :key="lot.id" class="card" style="width: 18rem;">
                <h5> {{lot.prime_location_name}} </h5>
                <p> <b> Address : </b> {{lot.address}} </p>
                <p> <b> Pincode :</b> {{lot.pincode}} </p>
                <p> <b> Price : </b> {{lot.price}} </p>
            </div>
        </div>
        <div v-if="!user && lots.length ===0">
            <p class="text-danger"> No Result Found </p>
        </div>
    </div>
    `,
    data(){
        return {
            user : null,
            lots : []
        }
    },
    mounted(){
        this.runsearch();
    },
    methods : {
        runsearch(){
            const id = this.$route.params.id;
            const location = this.$route.params.location;
            if(id) this.searchUser(id);
            if(location) this.searchLot(location);
        },
        async searchUser(id){
            const res = await fetch(`/api/search/user/${id}`,{
                headers : {"Authentication-Token" : localStorage.getItem("auth-token")}
            });
            this.user = res.status === 200 ? await res.json() : null
        },
        async searchLot(location){
            const res = await fetch(`/api/search/lot?location=${location}`,{
                headers : {"Authentication-Token" : localStorage.getItem("auth-token")}
            });
            const data = await res.json();
            this.lots = data.results || []
        }
    }
}