const axios=require("axios");

const getlanguageById=(data)=>{
    const language={
        "c++":54,
        "java":62,
        "js":63,

    }
    return language[data.toLowerCase()];

}




const waiting = async(timer) => {
  return new Promise(resolve => setTimeout(resolve, timer));
}




const sumbitBatch = async (submissions) => {
    // Encode each submission field to base64
    const encodedSubmissions = submissions.map(sub => ({
        source_code: Buffer.from(sub.source_code).toString('base64'),
        language_id: sub.language_id,
        stdin: sub.stdin ? Buffer.from(sub.stdin).toString('base64') : null,
        expected_output: sub.expected_output ? Buffer.from(sub.expected_output).toString('base64') : null
    }));

    const options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: {
            base64_encoded: 'true'
        },
        headers: {
            'x-rapidapi-key': 'b751a34243mshba7b91181e63318p19c5cajsne9168e341d1c',
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: {
            submissions: encodedSubmissions
        }
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error("Error in sumbitBatch:", error.message);
        throw error;
    }
}

// ✅ FIXED: Decode base64 responses
const sumbittoken = async (resulttoken) => {
    const options = {
        method: 'GET',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: {
            tokens: resulttoken.join(","),
            base64_encoded: 'true',
            fields: '*'
        },
        headers: {
            'x-rapidapi-key': 'b751a34243mshba7b91181e63318p19c5cajsne9168e341d1c',
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
        }
    };

    const fetchData = async () => {
        try {
            const response = await axios.request(options);
            return response.data;
        } catch (error) {
            console.error("Error in sumbittoken:", error.message);
            throw error;
        }
    }

    // Poll until all submissions are complete
    while (true) {
        const result = await fetchData();
        const isresult = result.submissions.every((r) => r.status_id > 2);
        
        if (isresult) {
            // ✅ Decode base64 fields in the response
            const decodedSubmissions = result.submissions.map(submission => ({
                ...submission,
                source_code: submission.source_code ? 
                    Buffer.from(submission.source_code, 'base64').toString('utf-8') : null,
                stdout: submission.stdout ? 
                    Buffer.from(submission.stdout, 'base64').toString('utf-8') : null,
                stderr: submission.stderr ? 
                    Buffer.from(submission.stderr, 'base64').toString('utf-8') : null,
                compile_output: submission.compile_output ? 
                    Buffer.from(submission.compile_output, 'base64').toString('utf-8') : null,
                message: submission.message ? 
                    Buffer.from(submission.message, 'base64').toString('utf-8') : null
            }));
            
            return decodedSubmissions;
        }
        
        await waiting(1000);
    }
}


























































module.exports={getlanguageById,sumbitBatch,sumbittoken};