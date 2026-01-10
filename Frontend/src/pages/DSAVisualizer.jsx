import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, SkipBack, Search } from 'lucide-react';

const DSAVisualizer = () => {
  const [category, setCategory] = useState('sorting');
  const [algorithm, setAlgorithm] = useState('bubble');
  const [array, setArray] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [comparisons, setComparisons] = useState(0);
  const [operations, setOperations] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [searchTarget, setSearchTarget] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const animationRef = useRef(null);

  const algorithms = {
    sorting: [
      { id: 'bubble', name: 'Bubble Sort', complexity: 'O(n²)' },
      { id: 'selection', name: 'Selection Sort', complexity: 'O(n²)' },
      { id: 'insertion', name: 'Insertion Sort', complexity: 'O(n²)' },
      { id: 'merge', name: 'Merge Sort', complexity: 'O(n log n)' },
      { id: 'quick', name: 'Quick Sort', complexity: 'O(n log n)' }
    ],
    searching: [
      { id: 'linear', name: 'Linear Search', complexity: 'O(n)' },
      { id: 'binary', name: 'Binary Search', complexity: 'O(log n)' },
      { id: 'jump', name: 'Jump Search', complexity: 'O(√n)' }
    ]
  };

  useEffect(() => {
    generateArray();
  }, []);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length) {
      animationRef.current = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 1000 - speed * 9);
    } else if (currentStep >= steps.length) {
      setIsPlaying(false);
    }
    return () => clearTimeout(animationRef.current);
  }, [isPlaying, currentStep, steps, speed]);

  useEffect(() => {
    if (category === 'searching') {
      if (algorithm === 'binary') {
        const sorted = Array.from({ length: 15 }, (_, i) => (i + 1) * 5 + Math.floor(Math.random() * 5));
        setArray(sorted);
      }
    }
  }, [category, algorithm]);

  const generateArray = (size = 15) => {
    const isSorted = category === 'searching' && algorithm === 'binary';
    let newArray;
    
    if (isSorted) {
      newArray = Array.from({ length: size }, (_, i) => (i + 1) * 5 + Math.floor(Math.random() * 5));
    } else {
      newArray = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 10);
    }
    
    setArray(newArray);
    setCurrentStep(0);
    setComparisons(0);
    setOperations(0);
    setSteps([]);
    setIsPlaying(false);
    setSearchTarget(null);
    setSearchInput('');
  };

  const bubbleSort = (arr) => {
    const steps = [];
    const tempArr = [...arr];
    let comps = 0, ops = 0;

    for (let i = 0; i < tempArr.length - 1; i++) {
      for (let j = 0; j < tempArr.length - i - 1; j++) {
        comps++;
        steps.push({
          array: [...tempArr],
          comparing: [j, j + 1],
          sorted: Array.from({ length: tempArr.length }, (_, k) => k >= tempArr.length - i),
          comparisons: comps,
          operations: ops,
          message: `Comparing ${tempArr[j]} and ${tempArr[j + 1]}`
        });

        if (tempArr[j] > tempArr[j + 1]) {
          [tempArr[j], tempArr[j + 1]] = [tempArr[j + 1], tempArr[j]];
          ops++;
          steps.push({
            array: [...tempArr],
            swapping: [j, j + 1],
            sorted: Array.from({ length: tempArr.length }, (_, k) => k >= tempArr.length - i),
            comparisons: comps,
            operations: ops,
            message: `Swapped ${tempArr[j + 1]} and ${tempArr[j]}`
          });
        }
      }
    }

    steps.push({
      array: [...tempArr],
      sorted: Array(tempArr.length).fill(true),
      comparisons: comps,
      operations: ops,
      message: 'Array is sorted!'
    });

    return steps;
  };

  const selectionSort = (arr) => {
    const steps = [];
    const tempArr = [...arr];
    let comps = 0, ops = 0;

    for (let i = 0; i < tempArr.length - 1; i++) {
      let minIdx = i;
      
      for (let j = i + 1; j < tempArr.length; j++) {
        comps++;
        steps.push({
          array: [...tempArr],
          comparing: [minIdx, j],
          current: i,
          sorted: Array.from({ length: tempArr.length }, (_, k) => k < i),
          comparisons: comps,
          operations: ops,
          message: `Finding minimum in unsorted portion`
        });

        if (tempArr[j] < tempArr[minIdx]) {
          minIdx = j;
        }
      }

      if (minIdx !== i) {
        [tempArr[i], tempArr[minIdx]] = [tempArr[minIdx], tempArr[i]];
        ops++;
        steps.push({
          array: [...tempArr],
          swapping: [i, minIdx],
          sorted: Array.from({ length: tempArr.length }, (_, k) => k <= i),
          comparisons: comps,
          operations: ops,
          message: `Placed ${tempArr[i]} in position ${i}`
        });
      }
    }

    steps.push({
      array: [...tempArr],
      sorted: Array(tempArr.length).fill(true),
      comparisons: comps,
      operations: ops,
      message: 'Array is sorted!'
    });

    return steps;
  };

  const insertionSort = (arr) => {
    const steps = [];
    const tempArr = [...arr];
    let comps = 0, ops = 0;

    for (let i = 1; i < tempArr.length; i++) {
      let key = tempArr[i];
      let j = i - 1;

      while (j >= 0 && tempArr[j] > key) {
        comps++;
        steps.push({
          array: [...tempArr],
          comparing: [j, j + 1],
          current: i,
          sorted: Array.from({ length: tempArr.length }, (_, k) => k < i),
          comparisons: comps,
          operations: ops,
          message: `Inserting ${key} into sorted portion`
        });

        tempArr[j + 1] = tempArr[j];
        ops++;
        j--;
      }
      
      tempArr[j + 1] = key;
      steps.push({
        array: [...tempArr],
        sorted: Array.from({ length: tempArr.length }, (_, k) => k <= i),
        comparisons: comps,
        operations: ops,
        message: `Inserted ${key} at correct position`
      });
    }

    steps.push({
      array: [...tempArr],
      sorted: Array(tempArr.length).fill(true),
      comparisons: comps,
      operations: ops,
      message: 'Array is sorted!'
    });

    return steps;
  };

  const quickSort = (arr) => {
    const steps = [];
    const tempArr = [...arr];
    let comps = 0, ops = 0;

    const partition = (low, high) => {
      const pivot = tempArr[high];
      let i = low - 1;

      for (let j = low; j < high; j++) {
        comps++;
        steps.push({
          array: [...tempArr],
          comparing: [j, high],
          pivot: high,
          comparisons: comps,
          operations: ops,
          message: `Comparing ${tempArr[j]} with pivot ${pivot}`
        });

        if (tempArr[j] < pivot) {
          i++;
          if (i !== j) {
            [tempArr[i], tempArr[j]] = [tempArr[j], tempArr[i]];
            ops++;
            steps.push({
              array: [...tempArr],
              swapping: [i, j],
              pivot: high,
              comparisons: comps,
              operations: ops,
              message: `Swapped ${tempArr[i]} and ${tempArr[j]}`
            });
          }
        }
      }

      [tempArr[i + 1], tempArr[high]] = [tempArr[high], tempArr[i + 1]];
      ops++;
      steps.push({
        array: [...tempArr],
        swapping: [i + 1, high],
        comparisons: comps,
        operations: ops,
        message: `Placed pivot ${pivot} at correct position`
      });

      return i + 1;
    };

    const quick = (low, high) => {
      if (low < high) {
        const pi = partition(low, high);
        quick(low, pi - 1);
        quick(pi + 1, high);
      }
    };

    quick(0, tempArr.length - 1);

    steps.push({
      array: [...tempArr],
      sorted: Array(tempArr.length).fill(true),
      comparisons: comps,
      operations: ops,
      message: 'Array is sorted!'
    });

    return steps;
  };

  const mergeSort = (arr) => {
    const steps = [];
    const tempArr = [...arr];
    let comps = 0, ops = 0;

    const merge = (left, mid, right) => {
      const leftArr = tempArr.slice(left, mid + 1);
      const rightArr = tempArr.slice(mid + 1, right + 1);
      let i = 0, j = 0, k = left;

      while (i < leftArr.length && j < rightArr.length) {
        comps++;
        steps.push({
          array: [...tempArr],
          comparing: [left + i, mid + 1 + j],
          comparisons: comps,
          operations: ops,
          message: `Merging: comparing ${leftArr[i]} and ${rightArr[j]}`
        });

        if (leftArr[i] <= rightArr[j]) {
          tempArr[k] = leftArr[i];
          i++;
        } else {
          tempArr[k] = rightArr[j];
          j++;
        }
        ops++;
        k++;
      }

      while (i < leftArr.length) {
        tempArr[k] = leftArr[i];
        ops++;
        i++;
        k++;
      }

      while (j < rightArr.length) {
        tempArr[k] = rightArr[j];
        ops++;
        j++;
        k++;
      }

      steps.push({
        array: [...tempArr],
        merged: Array.from({ length: tempArr.length }, (_, idx) => idx >= left && idx <= right),
        comparisons: comps,
        operations: ops,
        message: `Merged subarray from ${left} to ${right}`
      });
    };

    const mergeSortHelper = (left, right) => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        mergeSortHelper(left, mid);
        mergeSortHelper(mid + 1, right);
        merge(left, mid, right);
      }
    };

    mergeSortHelper(0, tempArr.length - 1);

    steps.push({
      array: [...tempArr],
      sorted: Array(tempArr.length).fill(true),
      comparisons: comps,
      operations: ops,
      message: 'Array is sorted!'
    });

    return steps;
  };

  const linearSearch = (arr, target) => {
    const steps = [];
    let comps = 0;

    for (let i = 0; i < arr.length; i++) {
      comps++;
      steps.push({
        array: [...arr],
        searching: i,
        comparisons: comps,
        operations: 0,
        message: `Checking index ${i}: ${arr[i]} ${arr[i] === target ? '==' : '!='} ${target}`
      });

      if (arr[i] === target) {
        steps.push({
          array: [...arr],
          found: i,
          comparisons: comps,
          operations: 0,
          message: `Found ${target} at index ${i}!`
        });
        return steps;
      }
    }

    steps.push({
      array: [...arr],
      comparisons: comps,
      operations: 0,
      message: `${target} not found in array`
    });

    return steps;
  };

  const binarySearch = (arr, target) => {
    const steps = [];
    let comps = 0;
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      comps++;

      steps.push({
        array: [...arr],
        searching: mid,
        range: [left, right],
        comparisons: comps,
        operations: 0,
        message: `Checking middle index ${mid}: ${arr[mid]} ${arr[mid] === target ? '==' : arr[mid] < target ? '<' : '>'} ${target}`
      });

      if (arr[mid] === target) {
        steps.push({
          array: [...arr],
          found: mid,
          comparisons: comps,
          operations: 0,
          message: `Found ${target} at index ${mid}!`
        });
        return steps;
      }

      if (arr[mid] < target) {
        left = mid + 1;
        steps.push({
          array: [...arr],
          range: [left, right],
          eliminated: Array.from({ length: arr.length }, (_, i) => i < left),
          comparisons: comps,
          operations: 0,
          message: `Search right half: [${left}, ${right}]`
        });
      } else {
        right = mid - 1;
        steps.push({
          array: [...arr],
          range: [left, right],
          eliminated: Array.from({ length: arr.length }, (_, i) => i > right),
          comparisons: comps,
          operations: 0,
          message: `Search left half: [${left}, ${right}]`
        });
      }
    }

    steps.push({
      array: [...arr],
      comparisons: comps,
      operations: 0,
      message: `${target} not found in array`
    });

    return steps;
  };

  const jumpSearch = (arr, target) => {
    const steps = [];
    let comps = 0;
    const n = arr.length;
    const jumpSize = Math.floor(Math.sqrt(n));
    let jump = jumpSize;
    let prev = 0;

    while (prev < n && arr[Math.min(jump, n) - 1] < target) {
      comps++;
      steps.push({
        array: [...arr],
        searching: Math.min(jump, n) - 1,
        range: [prev, Math.min(jump, n) - 1],
        comparisons: comps,
        operations: 0,
        message: `Jumping: checking index ${Math.min(jump, n) - 1}`
      });

      prev = jump;
      jump += jumpSize;

      if (prev >= n) {
        steps.push({
          array: [...arr],
          comparisons: comps,
          operations: 0,
          message: `${target} not found in array`
        });
        return steps;
      }
    }

    for (let i = prev; i < Math.min(jump, n); i++) {
      comps++;
      steps.push({
        array: [...arr],
        searching: i,
        range: [prev, Math.min(jump, n) - 1],
        comparisons: comps,
        operations: 0,
        message: `Linear search in block: checking index ${i}`
      });

      if (arr[i] === target) {
        steps.push({
          array: [...arr],
          found: i,
          comparisons: comps,
          operations: 0,
          message: `Found ${target} at index ${i}!`
        });
        return steps;
      }
    }

    steps.push({
      array: [...arr],
      comparisons: comps,
      operations: 0,
      message: `${target} not found in array`
    });

    return steps;
  };

  const startVisualization = () => {
    if (category === 'searching') {
      if (!searchInput) {
        alert('Please enter a number to search!');
        return;
      }
      const target = parseInt(searchInput);
      if (isNaN(target)) {
        alert('Please enter a valid number!');
        return;
      }
      setSearchTarget(target);
    }

    if (steps.length === 0) {
      let newSteps;
      
      if (category === 'sorting') {
        switch (algorithm) {
          case 'bubble':
            newSteps = bubbleSort(array);
            break;
          case 'selection':
            newSteps = selectionSort(array);
            break;
          case 'insertion':
            newSteps = insertionSort(array);
            break;
          case 'quick':
            newSteps = quickSort(array);
            break;
          case 'merge':
            newSteps = mergeSort(array);
            break;
          default:
            newSteps = bubbleSort(array);
        }
      } else if (category === 'searching') {
        const target = parseInt(searchInput);
        switch (algorithm) {
          case 'linear':
            newSteps = linearSearch(array, target);
            break;
          case 'binary':
            newSteps = binarySearch(array, target);
            break;
          case 'jump':
            newSteps = jumpSearch(array, target);
            break;
          default:
            newSteps = linearSearch(array, target);
        }
      }
      
      setSteps(newSteps);
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const pauseVisualization = () => {
    setIsPlaying(false);
  };

  const resetVisualization = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setSteps([]);
    setComparisons(0);
    setOperations(0);
    setSearchTarget(null);
  };

  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const stepBackward = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentState = steps[currentStep] || {
    array: array,
    comparing: [],
    swapping: [],
    sorted: [],
    searching: -1,
    found: -1,
    range: [],
    eliminated: [],
    current: -1,
    pivot: -1,
    comparisons: 0,
    operations: 0,
    message: ''
  };

  const maxValue = Math.max(...(currentState.array.length > 0 ? currentState.array : [100]));

  const getBarColor = (index) => {
    if (currentState.found === index) return 'bg-emerald-500';
    if (currentState.searching === index) return 'bg-amber-500';
    if (currentState.eliminated?.[index]) return 'bg-slate-700';
    if (currentState.sorted?.[index]) return 'bg-emerald-500';
    if (currentState.swapping?.includes(index)) return 'bg-rose-500';
    if (currentState.comparing?.includes(index)) return 'bg-amber-500';
    if (currentState.pivot === index) return 'bg-purple-500';
    if (currentState.current === index) return 'bg-blue-500';
    if (currentState.range?.length === 2 && index >= currentState.range[0] && index <= currentState.range[1]) return 'bg-cyan-500';
    return 'bg-blue-400';
  };

  const changeCategory = (newCat) => {
    setCategory(newCat);
    setAlgorithm(algorithms[newCat][0].id);
    resetVisualization();
    setSearchInput('');
    setSearchTarget(null);
    
    if (newCat === 'searching' && algorithms[newCat][0].id === 'binary') {
      const sorted = Array.from({ length: 15 }, (_, i) => (i + 1) * 5 + Math.floor(Math.random() * 5));
      setArray(sorted);
    } else {
      generateArray();
    }
  };

  const changeAlgorithm = (newAlgo) => {
    setAlgorithm(newAlgo);
    resetVisualization();
    setSearchInput('');
    setSearchTarget(null);
    
    if (category === 'searching' && newAlgo === 'binary') {
      const sorted = Array.from({ length: 15 }, (_, i) => (i + 1) * 5 + Math.floor(Math.random() * 5));
      setArray(sorted);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            DSA Visualizer
          </h1>
          <p className="text-slate-400">Interactive algorithm visualization platform</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3 space-y-4">
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-800">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">📚</span>
                Categories
              </h3>
              <div className="space-y-2">
                {Object.keys(algorithms).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => changeCategory(cat)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      category === cat
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-800">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Algorithms
              </h3>
              <div className="space-y-2">
                {algorithms[category].map((algo) => (
                  <button
                    key={algo.id}
                    onClick={() => changeAlgorithm(algo.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      algorithm === algo.id
                        ? 'bg-gradient-to-r from-emerald-500/20 to-blue-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="font-medium">{algo.name}</div>
                    <div className="text-xs opacity-60 mt-1">{algo.complexity}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-800">
              <h3 className="text-lg font-bold mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Comparisons</span>
                  <span className="text-amber-400 font-bold">{currentState.comparisons || comparisons}</span>
                </div>
                {category === 'sorting' && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Operations</span>
                    <span className="text-rose-400 font-bold">{currentState.operations || operations}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Array Size</span>
                  <span className="text-blue-400 font-bold">{array.length}</span>
                </div>
                {searchTarget !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Target</span>
                    <span className="text-emerald-400 font-bold">{searchTarget}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-9 space-y-6">
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {algorithms[category].find(a => a.id === algorithm)?.name}
                </h2>
                <div className="flex items-center gap-3">
                  {category === 'searching' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Enter target"
                        className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white w-32 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                  <button
                    onClick={() => generateArray(15)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all text-sm"
                  >
                    Generate New Array
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={stepBackward}
                  disabled={currentStep === 0}
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all disabled:opacity-30"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                
                {isPlaying ? (
                  <button
                    onClick={pauseVisualization}
                    className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg transition-all"
                  >
                    <Pause className="w-6 h-6" />
                  </button>
                ) : (
                  <button
                    onClick={startVisualization}
                    className="p-4 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 rounded-lg transition-all"
                  >
                    <Play className="w-6 h-6" />
                  </button>
                )}

                <button
                  onClick={stepForward}
                  disabled={currentStep >= steps.length - 1}
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all disabled:opacity-30"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                <button
                  onClick={resetVisualization}
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <div className="flex-1 mx-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 whitespace-nowrap">Speed:</span>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={speed}
                      onChange={(e) => setSpeed(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-blue-400 font-medium w-12 text-right">{speed}%</span>
                  </div>
                </div>

                <div className="text-sm text-slate-400">
                  Step: <span className="text-white font-bold">{currentStep}</span> / {steps.length}
                </div>
              </div>

              {currentState.message && (
                <div className="mb-4 px-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 text-sm">
                  {currentState.message}
                </div>
              )}

              <div className="flex items-center gap-4 mb-6 text-xs flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-400 rounded"></div>
                  <span className="text-slate-400">Default</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-500 rounded"></div>
                  <span className="text-slate-400">Comparing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-rose-500 rounded"></div>
                  <span className="text-slate-400">Swapping</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                  <span className="text-slate-400">Sorted/Found</span>
                </div>
                {category === 'sorting' && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <span className="text-slate-400">Pivot</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-cyan-500 rounded"></div>
                      <span className="text-slate-400">Active Range</span>
                    </div>
                  </>
                )}
                {category === 'searching' && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-700 rounded"></div>
                    <span className="text-slate-400">Eliminated</span>
                  </div>
                )}
              </div>

              <div className="bg-slate-800/50 rounded-xl p-8 min-h-[400px] flex items-end justify-center gap-2">
                {currentState.array.map((value, index) => (
                  <div key={index} className="flex flex-col items-center gap-2 flex-1">
                    <div className="text-xs text-slate-400 font-mono h-4">
                      {(currentState.comparing?.includes(index) || 
                        currentState.swapping?.includes(index) || 
                        currentState.searching === index ||
                        currentState.found === index) && value}
                    </div>
                    <div
                      className={`w-full ${getBarColor(index)} rounded-t-lg transition-all duration-300 flex items-end justify-center pb-2`}
                      style={{
                        height: `${(value / maxValue) * 300}px`,
                        minHeight: '40px'
                      }}
                    >
                      <span className="text-xs font-bold text-white opacity-80">{value}</span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">{index}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-800">
              <h3 className="text-lg font-bold mb-4">Algorithm Info</h3>
              <div className="space-y-4 text-sm text-slate-300">
                {algorithm === 'bubble' && (
                  <>
                    <p><strong className="text-blue-400">Time Complexity:</strong> O(n²) - Quadratic time</p>
                    <p><strong className="text-blue-400">Space Complexity:</strong> O(1) - Constant space</p>
                    <p><strong className="text-blue-400">Description:</strong> Repeatedly steps through the list, compares adjacent elements and swaps them if they're in the wrong order. The pass through the list is repeated until the list is sorted.</p>
                    <p><strong className="text-blue-400">Best For:</strong> Small datasets or nearly sorted data</p>
                  </>
                )}
                {algorithm === 'selection' && (
                  <>
                    <p><strong className="text-emerald-400">Time Complexity:</strong> O(n²) - Quadratic time</p>
                    <p><strong className="text-emerald-400">Space Complexity:</strong> O(1) - Constant space</p>
                    <p><strong className="text-emerald-400">Description:</strong> Divides the list into sorted and unsorted regions. Repeatedly selects the smallest element from the unsorted region and moves it to the end of the sorted region.</p>
                    <p><strong className="text-emerald-400">Best For:</strong> Small datasets where memory writes are expensive</p>
                  </>
                )}
                {algorithm === 'insertion' && (
                  <>
                    <p><strong className="text-purple-400">Time Complexity:</strong> O(n²) worst case, O(n) best case</p>
                    <p><strong className="text-purple-400">Space Complexity:</strong> O(1) - Constant space</p>
                    <p><strong className="text-purple-400">Description:</strong> Builds the final sorted array one item at a time. Takes each element and inserts it into its correct position in the already sorted portion.</p>
                    <p><strong className="text-purple-400">Best For:</strong> Small datasets or nearly sorted data, online sorting</p>
                  </>
                )}
                {algorithm === 'quick' && (
                  <>
                    <p><strong className="text-rose-400">Time Complexity:</strong> O(n log n) average, O(n²) worst case</p>
                    <p><strong className="text-rose-400">Space Complexity:</strong> O(log n) - Logarithmic space</p>
                    <p><strong className="text-rose-400">Description:</strong> Divides the array into smaller sub-arrays around a pivot element. Elements smaller than pivot go left, larger go right. Recursively sorts sub-arrays.</p>
                    <p><strong className="text-rose-400">Best For:</strong> Large datasets, general purpose sorting</p>
                  </>
                )}
                {algorithm === 'merge' && (
                  <>
                    <p><strong className="text-cyan-400">Time Complexity:</strong> O(n log n) - Linearithmic time</p>
                    <p><strong className="text-cyan-400">Space Complexity:</strong> O(n) - Linear space</p>
                    <p><strong className="text-cyan-400">Description:</strong> Divides the array into halves, recursively sorts them, and then merges the sorted halves back together. Stable sorting algorithm.</p>
                    <p><strong className="text-cyan-400">Best For:</strong> Large datasets, when stable sorting is required</p>
                  </>
                )}
                {algorithm === 'linear' && (
                  <>
                    <p><strong className="text-blue-400">Time Complexity:</strong> O(n) - Linear time</p>
                    <p><strong className="text-blue-400">Space Complexity:</strong> O(1) - Constant space</p>
                    <p><strong className="text-blue-400">Description:</strong> Sequentially checks each element until the target is found or the end is reached. Works on both sorted and unsorted arrays.</p>
                    <p><strong className="text-blue-400">Best For:</strong> Small datasets, unsorted data, or when target is likely near the beginning</p>
                  </>
                )}
                {algorithm === 'binary' && (
                  <>
                    <p><strong className="text-emerald-400">Time Complexity:</strong> O(log n) - Logarithmic time</p>
                    <p><strong className="text-emerald-400">Space Complexity:</strong> O(1) - Constant space</p>
                    <p><strong className="text-emerald-400">Description:</strong> Repeatedly divides the sorted array in half. Compares the middle element with target and eliminates half of the remaining elements based on comparison.</p>
                    <p><strong className="text-emerald-400">Best For:</strong> Large sorted datasets, when fast lookups are required</p>
                    <p><strong className="text-amber-400">Note:</strong> Requires sorted array!</p>
                  </>
                )}
                {algorithm === 'jump' && (
                  <>
                    <p><strong className="text-purple-400">Time Complexity:</strong> O(√n) - Square root time</p>
                    <p><strong className="text-purple-400">Space Complexity:</strong> O(1) - Constant space</p>
                    <p><strong className="text-purple-400">Description:</strong> Jumps ahead by fixed steps (√n) to find the block containing the target, then performs linear search within that block.</p>
                    <p><strong className="text-purple-400">Best For:</strong> Sorted arrays where binary search overhead is too high</p>
                    <p><strong className="text-amber-400">Note:</strong> Requires sorted array!</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSAVisualizer;