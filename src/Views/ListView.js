export class ListView{
    render(data){
        this.data = data;
        const html = this.generateHTMLString(); 
        this.container.innerHTML = html;
    }

    pushTransitionInContainer(transaction){
        this.container.insertAdjacentHTML(
            "afterbegin", 
            this.generateCardHTML(transaction)
        );
    }

    generateCardHTML(transaction){
        return `<div>${description} - ${transaction.value}</div>`;
    }

    generateHTMLString(){
        const data = this.data;
        let html = "";
        if(Array.isArray(data)){
            data.forEach(transaction=>{
                const description = (transaction.description || "").trim() || "No description";
                html += this.generateCardHTML(transaction); 
            })
        }
        return html;
    }
}
