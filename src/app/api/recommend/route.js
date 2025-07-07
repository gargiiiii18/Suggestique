

export async function POST(req) {
    try {
        const {occasion, country, formality, context, gender} = await req.json();
        console.log({occasion, country, formality, context, gender});
        const url = 'http://127.0.0.1:8000/predict';
        const res = await fetch(url, {
            method : 'POST',
            headers : {
                'Content-Type': 'application/json',
            },
            body : JSON.stringify({
                occasion,
                country,
                formality,
                context,
                gender
        })
    }
        );
        const result = await res.json();
        console.log(result);
        
        if(res.ok){
            return Response.json(result);
        }
            return Response.json({status: 500, message: "Fetching recommendations failed."})
    } catch (error) {
        console.log(error);  
    }
}