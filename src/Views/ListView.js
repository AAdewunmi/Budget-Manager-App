export class ListView{
    render(data){
        this.data = data;
        const html = this.generateHTMLString(); 
        this.container.innerHTML = html;
    }

    pushTransitionInContainer(){
        this.container.insertAdjacentHTML("afterbegin", )
    }

    generateHTMLString(){
        const data = this.data;
        let html = "";
        if(Array.isArray(data)){
            data.forEach(transaction=>{
                const description = (transaction.description || "").trim() || "No description";
                html+=`<div>${description} - ${transaction.value}</div>`
            })
        }
        return html;
    }
}
