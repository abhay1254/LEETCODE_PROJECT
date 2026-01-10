import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axios';
import { useNavigate } from 'react-router';

// Zod schema - updated to match backend expectations
const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulity: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linklist', 'graph', 'dp']),
  visibletestcases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explaination: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddentestcases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startcode: z.array(
    z.object({
      language: z.enum(['c++', 'java', 'js']), // Changed to lowercase to match backend
      intialcode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  refrenceSoluation: z.array(
    z.object({
      language: z.enum(['c++', 'java', 'js']), // Changed to lowercase to match backend
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

function AdminPanel() {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      startcode: [
        { language: 'c++', intialcode: '' }, // Changed to lowercase
        { language: 'java', intialcode: '' },
        { language: 'js', intialcode: '' } // Changed to 'js'
      ],
      refrenceSoluation: [
        { language: 'c++', completeCode: '' }, // Changed to lowercase
        { language: 'java', completeCode: '' },
        { language: 'js', completeCode: '' } // Changed to 'js'
      ]
    }
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({ control, name: 'visibletestcases' });
  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({ control, name: 'hiddentestcases' });

 const onSubmit = async (data) => {
  console.log("========== FRONTEND: SUBMITTING PROBLEM ==========");
  console.log("1. Raw Form Data:", JSON.stringify(data, null, 2));
  
  // Validate data structure
  console.log("2. Checking data structure:");
  console.log("   - Title:", data.title);
  console.log("   - Difficulty:", data.difficulity);
  console.log("   - Tags:", data.tags);
  console.log("   - Visible test cases:", data.visibletestcases?.length);
  console.log("   - Hidden test cases:", data.hiddentestcases?.length);
  console.log("   - Start code entries:", data.startcode?.length);
  console.log("   - Reference solutions:", data.refrenceSoluation?.length);
  
  // Check startcode structure
  console.log("3. Start Code Structure:");
  data.startcode?.forEach((code, i) => {
    console.log(`   [${i}] Language: ${code.language}, Has intialcode: ${!!code.intialcode}, Length: ${code.intialcode?.length || 0}`);
  });
  
  // Check reference solution structure
  console.log("4. Reference Solution Structure:");
  data.refrenceSoluation?.forEach((sol, i) => {
    console.log(`   [${i}] Language: ${sol.language}, Has completeCode: ${!!sol.completeCode}, Length: ${sol.completeCode?.length || 0}`);
  });
  
  try {
    console.log("5. Sending POST request to /problem/create...");
    
    const response = await axiosClient.post('/problem/create', data);
    
    console.log("6. ✅ Response received:");
    console.log("   Status:", response.status);
    console.log("   Data:", response.data);
    
    alert('Problem created successfully!');
    navigate('/');
    
  } catch (error) {
    console.error("❌❌❌ ERROR OCCURRED ❌❌❌");
    console.error("Error object:", error);
    console.error("Response status:", error.response?.status);
    console.error("Response data:", error.response?.data);
    console.error("Error message:", error.message);
    
    // Show detailed error to user
    const errorMessage = error.response?.data?.message 
      || error.response?.data?.errors 
      || error.message;
      
    alert(`Error: ${JSON.stringify(errorMessage, null, 2)}`);
  }
  
  console.log("========== FRONTEND: END ==========");
};
 
 
 
 
 
 
 
 

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Problem</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <input {...register('title')} placeholder="Title" className={`input input-bordered w-full ${errors.title && 'input-error'}`} />
              {errors.title && <p className="text-error text-sm mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <textarea {...register('description')} placeholder="Description" className={`textarea textarea-bordered w-full h-32 ${errors.description && 'textarea-error'}`} />
              {errors.description && <p className="text-error text-sm mt-1">{errors.description.message}</p>}
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <select {...register('difficulity')} className={`select select-bordered w-full ${errors.difficulity && 'select-error'}`}>
                  <option value="">Select Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                {errors.difficulity && <p className="text-error text-sm mt-1">{errors.difficulity.message}</p>}
              </div>
              <div className="w-1/2">
                <select {...register('tags')} className={`select select-bordered w-full ${errors.tags && 'select-error'}`}>
                  <option value="">Select Tag</option>
                  <option value="array">Array</option>
                  <option value="linklist">Linked List</option>
                  <option value="graph">Graph</option>
                  <option value="dp">DP</option>
                </select>
                {errors.tags && <p className="text-error text-sm mt-1">{errors.tags.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Visible Test Cases */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Visible Test Cases</h2>
          <button type="button" onClick={() => appendVisible({ input: '', output: '', explaination: '' })} className="btn btn-sm btn-primary mb-4">
            Add Test Case
          </button>
          {errors.visibletestcases && <p className="text-error text-sm mb-2">{errors.visibletestcases.message}</p>}
          {visibleFields.map((field, i) => (
            <div key={field.id} className="border p-4 rounded mb-4">
              <h3 className="font-semibold mb-2">Test Case {i + 1}</h3>
              <input {...register(`visibletestcases.${i}.input`)} placeholder="Input" className="input input-bordered w-full mb-2" />
              {errors.visibletestcases?.[i]?.input && <p className="text-error text-sm mb-2">{errors.visibletestcases[i].input.message}</p>}
              
              <input {...register(`visibletestcases.${i}.output`)} placeholder="Output" className="input input-bordered w-full mb-2" />
              {errors.visibletestcases?.[i]?.output && <p className="text-error text-sm mb-2">{errors.visibletestcases[i].output.message}</p>}
              
              <textarea {...register(`visibletestcases.${i}.explaination`)} placeholder="Explanation" className="textarea textarea-bordered w-full mb-2" />
              {errors.visibletestcases?.[i]?.explaination && <p className="text-error text-sm mb-2">{errors.visibletestcases[i].explaination.message}</p>}
              
              <button type="button" onClick={() => removeVisible(i)} className="btn btn-xs btn-error">Remove</button>
            </div>
          ))}
        </div>

        {/* Hidden Test Cases */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Hidden Test Cases</h2>
          <button type="button" onClick={() => appendHidden({ input: '', output: '' })} className="btn btn-sm btn-primary mb-4">
            Add Test Case
          </button>
          {errors.hiddentestcases && <p className="text-error text-sm mb-2">{errors.hiddentestcases.message}</p>}
          {hiddenFields.map((field, i) => (
            <div key={field.id} className="border p-4 rounded mb-4">
              <h3 className="font-semibold mb-2">Test Case {i + 1}</h3>
              <input {...register(`hiddentestcases.${i}.input`)} placeholder="Input" className="input input-bordered w-full mb-2" />
              {errors.hiddentestcases?.[i]?.input && <p className="text-error text-sm mb-2">{errors.hiddentestcases[i].input.message}</p>}
              
              <input {...register(`hiddentestcases.${i}.output`)} placeholder="Output" className="input input-bordered w-full mb-2" />
              {errors.hiddentestcases?.[i]?.output && <p className="text-error text-sm mb-2">{errors.hiddentestcases[i].output.message}</p>}
              
              <button type="button" onClick={() => removeHidden(i)} className="btn btn-xs btn-error">Remove</button>
            </div>
          ))}
        </div>

        {/* Code Templates */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Code Templates</h2>
          {[0, 1, 2].map((i) => (
            <div key={i} className="mb-6">
              <h3 className="font-semibold mb-2">{i === 0 ? 'C++' : i === 1 ? 'Java' : 'JavaScript'}</h3>
              <div className="mb-4">
                <label className="label">
                  <span className="label-text">Initial Code (Starter Template)</span>
                </label>
                <textarea {...register(`startcode.${i}.intialcode`)} placeholder="Initial Code" className="textarea textarea-bordered w-full font-mono text-sm" rows={5} />
                {errors.startcode?.[i]?.intialcode && <p className="text-error text-sm mt-1">{errors.startcode[i].intialcode.message}</p>}
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Reference Solution (Complete Working Code)</span>
                </label>
                <textarea {...register(`refrenceSoluation.${i}.completeCode`)} placeholder="Reference Solution" className="textarea textarea-bordered w-full font-mono text-sm" rows={5} />
                {errors.refrenceSoluation?.[i]?.completeCode && <p className="text-error text-sm mt-1">{errors.refrenceSoluation[i].completeCode.message}</p>}
              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn-primary w-full">Create Problem</button>
      </form>
    </div>
  );
}

export default AdminPanel;