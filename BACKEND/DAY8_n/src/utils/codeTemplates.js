const createExecutableCode = (solutionCode, language, problemTag, testCases) => {
    const tag = problemTag?.toLowerCase() || '';
    const cleanCode = solutionCode.trim();
    
    // Check if user already wrote complete code
    const hasMain = cleanCode.includes('int main(') || 
                    cleanCode.includes('public static void main') || 
                    cleanCode.includes('function main(');
    
    if (hasMain) {
        return cleanCode;
    }
    
    // Extract method name
    const extractMethodName = (code) => {
        const cppMatch = code.match(/\b(?:int|bool|string|vector|ListNode\*)\s+(\w+)\s*\(/);
        if (cppMatch) return cppMatch[1];
        
        const javaMatch = code.match(/public\s+\w+\s+(\w+)\s*\(/);
        if (javaMatch) return javaMatch[1];
        
        const jsMatch = code.match(/(?:var|const|let)\s+(\w+)\s*=/);
        if (jsMatch) return jsMatch[1];
        
        return null;
    };
    
    const methodName = extractMethodName(cleanCode);
    console.log(`   Detected method name: ${methodName}`);
    
    if (!methodName) {
        throw new Error('Could not detect method name from solution code');
    }
    
   
     if (language.toLowerCase() === 'c++') {
    // Linked List Problems
    if (tag.includes('linklist') || tag.includes('linked') || tag.includes('list')) {
        return `
#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

${cleanCode}

ListNode* createList(vector<int>& nums) {
    if (nums.empty()) return nullptr;
    ListNode* head = new ListNode(nums[0]);
    ListNode* current = head;
    for (int i = 1; i < nums.size(); i++) {
        current->next = new ListNode(nums[i]);
        current = current->next;
    }
    return head;
}

void printList(ListNode* head) {
    cout << "[";
    bool first = true;
    while (head != nullptr) {
        if (!first) cout << ",";
        cout << head->val;
        first = false;
        head = head->next;
    }
    cout << "]";
}

int main() {
    string input;
    getline(cin, input);
    input = input.substr(1, input.length() - 2);
    vector<int> nums;
    
    if (!input.empty()) {
        stringstream ss(input);
        string token;
        while (getline(ss, token, ',')) {
            nums.push_back(stoi(token));
        }
    }
    
    ListNode* head = createList(nums);
    Solution solution;
    ListNode* result = solution.${methodName}(head);
    printList(result);
    cout << endl;
    return 0;
}
`;
    }
    
    // Check if method has multiple parameters
    const hasMultipleParams = cleanCode.match(/\(\s*vector<int>&\s*\w+\s*,\s*int\s+\w+/);
    
    if (hasMultipleParams) {
        // Two parameters: array and target
        return `
#include <iostream>
#include <vector>
#include <sstream>
#include <string>
#include <algorithm>
#include <unordered_map>
using namespace std;

${cleanCode}

vector<int> parseArray(const string& str) {
    vector<int> result;
    if (str.empty()) return result;
    
    stringstream ss(str);
    string token;
    while (getline(ss, token, ',')) {
        result.push_back(stoi(token));
    }
    return result;
}

void printArray(const vector<int>& arr) {
    cout << "[";
    for (size_t i = 0; i < arr.size(); i++) {
        if (i > 0) cout << ",";
        cout << arr[i];
    }
    cout << "]" << endl;
}

int main() {
    string input;
    getline(cin, input);
    
    size_t closeBracket = input.find(']');
    
    if (closeBracket != string::npos && closeBracket < input.length() - 1 && input[closeBracket + 1] == ',') {
        string arrayPart = input.substr(1, closeBracket - 1);
        string paramPart = input.substr(closeBracket + 2);
        
        vector<int> nums = parseArray(arrayPart);
        int target = stoi(paramPart);
        
        Solution solution;
        vector<int> result = solution.${methodName}(nums, target);
        printArray(result);
    } else {
        string arrayPart = input.substr(1, input.length() - 2);
        vector<int> nums = parseArray(arrayPart);
        
        Solution solution;
        int result = solution.${methodName}(nums);
        cout << result << endl;
    }
    
    return 0;
}
`;
    } else {
        // ✅ Single parameter: just array - THIS IS THE FIX!
        return `
#include <iostream>
#include <vector>
#include <sstream>
#include <string>
#include <algorithm>
using namespace std;

${cleanCode}

vector<int> parseArray(const string& str) {
    vector<int> result;
    if (str.empty()) return result;
    
    stringstream ss(str);
    string token;
    while (getline(ss, token, ',')) {
        result.push_back(stoi(token));
    }
    return result;
}

int main() {
    string input;
    getline(cin, input);
    
    string arrayPart = input.substr(1, input.length() - 2);
    vector<int> nums = parseArray(arrayPart);
    
    Solution solution;
    int result = solution.${methodName}(nums);
    cout << result << endl;
    
    return 0;
}
`;
    }
}
     if (language.toLowerCase() === 'c++') {
    // Linked List Problems
    if (tag.includes('linklist') || tag.includes('linked') || tag.includes('list')) {
        return `
#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

${cleanCode}

ListNode* createList(vector<int>& nums) {
    if (nums.empty()) return nullptr;
    ListNode* head = new ListNode(nums[0]);
    ListNode* current = head;
    for (int i = 1; i < nums.size(); i++) {
        current->next = new ListNode(nums[i]);
        current = current->next;
    }
    return head;
}

void printList(ListNode* head) {
    cout << "[";
    bool first = true;
    while (head != nullptr) {
        if (!first) cout << ",";
        cout << head->val;
        first = false;
        head = head->next;
    }
    cout << "]";
}

int main() {
    string input;
    getline(cin, input);
    input = input.substr(1, input.length() - 2);
    vector<int> nums;
    
    if (!input.empty()) {
        stringstream ss(input);
        string token;
        while (getline(ss, token, ',')) {
            nums.push_back(stoi(token));
        }
    }
    
    ListNode* head = createList(nums);
    Solution solution;
    ListNode* result = solution.${methodName}(head);
    printList(result);
    cout << endl;
    return 0;
}
`;
    }
    
    // Check if method has multiple parameters
    const hasMultipleParams = cleanCode.match(/\(\s*vector<int>&\s*\w+\s*,\s*int\s+\w+/);
    
    if (hasMultipleParams) {
        // Two parameters: array and target
        return `
#include <iostream>
#include <vector>
#include <sstream>
#include <string>
#include <algorithm>
#include <unordered_map>
using namespace std;

${cleanCode}

vector<int> parseArray(const string& str) {
    vector<int> result;
    if (str.empty()) return result;
    
    stringstream ss(str);
    string token;
    while (getline(ss, token, ',')) {
        result.push_back(stoi(token));
    }
    return result;
}

void printArray(const vector<int>& arr) {
    cout << "[";
    for (size_t i = 0; i < arr.size(); i++) {
        if (i > 0) cout << ",";
        cout << arr[i];
    }
    cout << "]" << endl;
}

int main() {
    string input;
    getline(cin, input);
    
    size_t closeBracket = input.find(']');
    
    if (closeBracket != string::npos && closeBracket < input.length() - 1 && input[closeBracket + 1] == ',') {
        string arrayPart = input.substr(1, closeBracket - 1);
        string paramPart = input.substr(closeBracket + 2);
        
        vector<int> nums = parseArray(arrayPart);
        int target = stoi(paramPart);
        
        Solution solution;
        vector<int> result = solution.${methodName}(nums, target);
        printArray(result);
    } else {
        string arrayPart = input.substr(1, input.length() - 2);
        vector<int> nums = parseArray(arrayPart);
        
        Solution solution;
        int result = solution.${methodName}(nums);
        cout << result << endl;
    }
    
    return 0;
}
`;
    } else {
        // ✅ Single parameter: just array - THIS IS THE FIX!
        return `
#include <iostream>
#include <vector>
#include <sstream>
#include <string>
#include <algorithm>
using namespace std;

${cleanCode}

vector<int> parseArray(const string& str) {
    vector<int> result;
    if (str.empty()) return result;
    
    stringstream ss(str);
    string token;
    while (getline(ss, token, ',')) {
        result.push_back(stoi(token));
    }
    return result;
}

int main() {
    string input;
    getline(cin, input);
    
    string arrayPart = input.substr(1, input.length() - 2);
    vector<int> nums = parseArray(arrayPart);
    
    Solution solution;
    int result = solution.${methodName}(nums);
    cout << result << endl;
    
    return 0;
}
`;
    }
}
    
    
    // ✅ ADD JAVA TEMPLATE
    if (language.toLowerCase() === 'java') {
        // Linked List Problems
        if (tag.includes('linklist') || tag.includes('linked') || tag.includes('list')) {
            return `
import java.util.*;

class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

${cleanCode}

public class Main {
    public static ListNode createList(int[] nums) {
        if (nums.length == 0) return null;
        ListNode head = new ListNode(nums[0]);
        ListNode current = head;
        for (int i = 1; i < nums.length; i++) {
            current.next = new ListNode(nums[i]);
            current = current.next;
        }
        return head;
    }
    
    public static void printList(ListNode head) {
        System.out.print("[");
        boolean first = true;
        while (head != null) {
            if (!first) System.out.print(",");
            System.out.print(head.val);
            first = false;
            head = head.next;
        }
        System.out.println("]");
    }
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine().trim();
        input = input.substring(1, input.length() - 1);
        
        if (input.isEmpty()) {
            System.out.println("[]");
            return;
        }
        
        String[] parts = input.split(",");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            nums[i] = Integer.parseInt(parts[i].trim());
        }
        
        ListNode head = createList(nums);
        Solution solution = new Solution();
        ListNode result = solution.${methodName}(head);
        printList(result);
    }
}
`;
        }
        
        // Check if method has multiple parameters
        const hasMultipleParams = cleanCode.match(/public\s+\w+\s+\w+\s*\(\s*int\[\]\s+\w+\s*,\s*int\s+\w+/);
        
        if (hasMultipleParams) {
            // Two parameters: array and target
            return `
import java.util.*;

${cleanCode}

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine().trim();
        
        int closeBracket = input.indexOf(']');
        
        if (closeBracket != -1 && closeBracket < input.length() - 1 && input.charAt(closeBracket + 1) == ',') {
            String arrayPart = input.substring(1, closeBracket);
            String paramPart = input.substring(closeBracket + 2).trim();
            
            String[] parts = arrayPart.isEmpty() ? new String[0] : arrayPart.split(",");
            int[] nums = new int[parts.length];
            for (int i = 0; i < parts.length; i++) {
                nums[i] = Integer.parseInt(parts[i].trim());
            }
            int target = Integer.parseInt(paramPart);
            
            Solution solution = new Solution();
            int[] result = solution.${methodName}(nums, target);
            
            System.out.print("[");
            for (int i = 0; i < result.length; i++) {
                if (i > 0) System.out.print(",");
                System.out.print(result[i]);
            }
            System.out.println("]");
        } else {
            String arrayPart = input.substring(1, input.length() - 1);
            String[] parts = arrayPart.isEmpty() ? new String[0] : arrayPart.split(",");
            int[] nums = new int[parts.length];
            for (int i = 0; i < parts.length; i++) {
                nums[i] = Integer.parseInt(parts[i].trim());
            }
            
            Solution solution = new Solution();
            int result = solution.${methodName}(nums);
            System.out.println(result);
        }
    }
}
`;
        } else {
            // Single parameter: just array
            return `
import java.util.*;

${cleanCode}

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine().trim();
        
        String arrayPart = input.substring(1, input.length() - 1);
        String[] parts = arrayPart.isEmpty() ? new String[0] : arrayPart.split(",");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            nums[i] = Integer.parseInt(parts[i].trim());
        }
        
        Solution solution = new Solution();
        int result = solution.${methodName}(nums);
        System.out.println(result);
    }
}
`;
        }
    }
    
    // ✅ ADD JAVASCRIPT TEMPLATE
    if (language.toLowerCase() === 'js' || language.toLowerCase() === 'javascript') {
        // Linked List
        if (tag.includes('linklist') || tag.includes('linked') || tag.includes('list')) {
            return `
class ListNode {
    constructor(val, next) {
        this.val = (val === undefined ? 0 : val);
        this.next = (next === undefined ? null : next);
    }
}

${cleanCode}

function createList(nums) {
    if (nums.length === 0) return null;
    let head = new ListNode(nums[0]);
    let current = head;
    for (let i = 1; i < nums.length; i++) {
        current.next = new ListNode(nums[i]);
        current = current.next;
    }
    return head;
}

function printList(head) {
    let result = "[";
    let first = true;
    while (head !== null) {
        if (!first) result += ",";
        result += head.val;
        first = false;
        head = head.next;
    }
    result += "]";
    console.log(result);
}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', (line) => {
    const input = line.trim().slice(1, -1);
    const nums = input ? input.split(',').map(Number) : [];
    const head = createList(nums);
    const result = ${methodName}(head);
    printList(result);
    rl.close();
});
`;
        }
        
        // Check if function has multiple parameters
        const hasMultipleParams = cleanCode.match(/function\s*\(\s*\w+\s*,\s*\w+/);
        
        if (hasMultipleParams) {
            return `
${cleanCode}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', (line) => {
    const input = line.trim();
    const closeBracket = input.indexOf(']');
    
    if (closeBracket !== -1 && closeBracket < input.length - 1 && input[closeBracket + 1] === ',') {
        const arrayPart = input.slice(1, closeBracket);
        const paramPart = input.slice(closeBracket + 2);
        const nums = arrayPart ? arrayPart.split(',').map(Number) : [];
        const target = parseInt(paramPart);
        const result = ${methodName}(nums, target);
        console.log('[' + result.join(',') + ']');
    } else {
        const arrayPart = input.slice(1, -1);
        const nums = arrayPart ? arrayPart.split(',').map(Number) : [];
        const result = ${methodName}(nums);
        console.log(result);
    }
    rl.close();
});
`;
        } else {
            return `
${cleanCode}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', (line) => {
    const input = line.trim();
    const arrayPart = input.slice(1, -1);
    const nums = arrayPart ? arrayPart.split(',').map(Number) : [];
    const result = ${methodName}(nums);
    console.log(result);
    rl.close();
});
`;
        }
    }
    
    return solutionCode;
};

module.exports = { createExecutableCode };