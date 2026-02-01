export class ListView{
    render(data){
        this.data = data;
        const html = this.generateHTMLString(); 
        this.container.innerHTML = html;
    }
    generateHTMLString(){
        const data = this.data;
        let html = "";
        if(Array.isArray(data)){
            data.forEach(transaction=>{
                html+=`<div>${transaction.value}</div>`
            })
        }
        return html;
    }
}