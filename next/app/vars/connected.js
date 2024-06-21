var logged = {
    state: false,
    true: function(){
        this.state= true
    },
    false: function(){
        this.state= false
    },
    name: '',
    setName: function(arg){
        this.name=arg
    }
}

export default logged