/**
 * 360 LeetCode Patterns Sheet (Made by a Microsoft Employee)
 * The definitive curated roadmap covering 15 Pattern Groups and 91 algorithmic patterns.
 * Completing these 360 problems assures clearing product-based company coding rounds (>5 LPA).
 */

export interface LeetCodeProblem {
  id: string;
  num?: string;
  title: string;
  url: string;
}

export interface LeetCodePattern {
  id: string;
  patternNumber: number;
  title: string;
  problems: LeetCodeProblem[];
}

export interface LeetCodePatternGroup {
  id: string;
  romanId: string;
  groupTitle: string;
  shortName: string;
  patternCount: number;
  problemCount: number;
  patterns: LeetCodePattern[];
}

const makeLeetCodeUrl = (title: string, num?: string) => {
  // If problem has a clean name, generate LeetCode problem slug or search link
  const cleanTitle = title.replace(/^\d+\.\s*/, '').trim();
  const slug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `https://leetcode.com/problems/${slug}/`;
};

const parseProblemsString = (patternPrefix: string, rawStr: string): LeetCodeProblem[] => {
  return rawStr
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item, idx) => {
      const match = item.match(/^(\d+)\.\s*(.+)$/);
      const num = match ? match[1] : undefined;
      const title = item;
      return {
        id: `${patternPrefix}-prob-${num || idx + 1}`,
        num,
        title,
        url: makeLeetCodeUrl(title, num),
      };
    });
};

export const LEETCODE_360_PATTERN_GROUPS: LeetCodePatternGroup[] = [
  {
    id: "group-1",
    romanId: "I",
    groupTitle: "I. Two Pointer Patterns",
    shortName: "Two Pointers",
    patternCount: 7,
    problemCount: 30,
    patterns: [
      {
        id: "pat-1",
        patternNumber: 1,
        title: "Pattern 1: Two Pointers - Converging (Sorted Array Target Sum)",
        problems: parseProblemsString("pat-1", "1. Two Sum, 11. Container With Most Water, 15. 3Sum, 16. 3Sum Closest, 18. 4Sum, 167. Two Sum II - Input Array Is Sorted, 349. Intersection of Two Arrays, 881. Boats to Save People, 977. Squares of a Sorted Array, 259. 3Sum Smaller"),
      },
      {
        id: "pat-2",
        patternNumber: 2,
        title: "Pattern 2: Two Pointers - Fast & Slow (Cycle Detection)",
        problems: parseProblemsString("pat-2", "141. Linked List Cycle, 202. Happy Number, 287. Find the Duplicate Number, 392. Is Subsequence"),
      },
      {
        id: "pat-3",
        patternNumber: 3,
        title: "Pattern 3: Two Pointers - Fixed Separation (Nth Node from End)",
        problems: parseProblemsString("pat-3", "19. Remove Nth Node From End of List, 876. Middle of the Linked List, 2095. Delete the Middle Node of a Linked List"),
      },
      {
        id: "pat-4",
        patternNumber: 4,
        title: "Pattern 4: Two Pointers - In-place Array Modification",
        problems: parseProblemsString("pat-4", "26. Remove Duplicates from Sorted Array, 27. Remove Element, 75. Sort Colors, 80. Remove Duplicates from Sorted Array II, 283. Move Zeroes, 443. String Compression, 905. Sort Array By Parity, 2337. Move Pieces to Obtain a String, 2938. Separate Black and White Balls"),
      },
      {
        id: "pat-5",
        patternNumber: 5,
        title: "Pattern 5: Two Pointers - String Comparison with Backspaces",
        problems: parseProblemsString("pat-5", "844. Backspace String Compare"),
      },
      {
        id: "pat-6",
        patternNumber: 6,
        title: "Pattern 6: Two Pointers - Expanding From Center (Palindromes)",
        problems: parseProblemsString("pat-6", "5. Longest Palindromic Substring, 647. Palindromic Substrings"),
      },
      {
        id: "pat-7",
        patternNumber: 7,
        title: "Pattern 7: Two Pointers - String Reversal",
        problems: parseProblemsString("pat-7", "151. Reverse Words in a String, 344. Reverse String, 345. Reverse Vowels of a String, 541. Reverse String II"),
      },
    ],
  },
  {
    id: "group-2",
    romanId: "II",
    groupTitle: "II. Sliding Window Patterns",
    shortName: "Sliding Window",
    patternCount: 4,
    problemCount: 30,
    patterns: [
      {
        id: "pat-8",
        patternNumber: 8,
        title: "Pattern 8: Sliding Window - Fixed Size (Subarray Calculation)",
        problems: parseProblemsString("pat-8", "346. Moving Average from Data Stream, 643. Maximum Average Subarray I, 2985. Calculate Compressed Mean, 3254. Find the Power of K-Size Subarrays I, 3318. Find X-Sum of All K-Long Subarrays I"),
      },
      {
        id: "pat-9",
        patternNumber: 9,
        title: "Pattern 9: Sliding Window - Variable Size (Condition-Based)",
        problems: parseProblemsString("pat-9", "3. Longest Substring Without Repeating Characters, 76. Minimum Window Substring, 209. Minimum Size Subarray Sum, 219. Contains Duplicate II, 424. Longest Repeating Character Replacement, 713. Subarray Product Less Than K, 904. Fruit Into Baskets, 1004. Max Consecutive Ones III, 1438. Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit, 1493. Longest Subarray of 1's After Deleting One Element, 1658. Minimum Operations to Reduce X to Zero, 1838. Frequency of the Most Frequent Element, 2461. Maximum Sum of Distinct Subarrays With Length K, 2516. Take K of Each Character From Left and Right, 2762. Continuous Subarrays, 2779. Maximum Beauty of an Array After Applying Operation, 2981. Find Longest Special Substring That Occurs Thrice I, 3026. Maximum Good Subarray Sum, 3346. Maximum Frequency of an Element After Performing Operations I, 3347. Maximum Frequency of an Element After Performing Operations II"),
      },
      {
        id: "pat-10",
        patternNumber: 10,
        title: "Pattern 10: Sliding Window - Monotonic Queue for Max/Min",
        problems: parseProblemsString("pat-10", "239. Sliding Window Maximum, 862. Shortest Subarray with Sum at Least K, 1696. Jump Game VI"),
      },
      {
        id: "pat-11",
        patternNumber: 11,
        title: "Pattern 11: Sliding Window - Character Frequency Matching",
        problems: parseProblemsString("pat-11", "438. Find All Anagrams in a String, 567. Permutation in String"),
      },
    ],
  },
  {
    id: "group-3",
    romanId: "III",
    groupTitle: "III. Tree Traversal Patterns (DFS & BFS)",
    shortName: "Trees (DFS & BFS)",
    patternCount: 6,
    problemCount: 33,
    patterns: [
      {
        id: "pat-12",
        patternNumber: 12,
        title: "Pattern 12: Tree BFS - Level Order Traversal",
        problems: parseProblemsString("pat-12", "102. Binary Tree Level Order Traversal, 103. Binary Tree Zigzag Level Order Traversal, 199. Binary Tree Right Side View, 515. Find Largest Value in Each Tree Row, 1161. Maximum Level Sum of a Binary Tree"),
      },
      {
        id: "pat-13",
        patternNumber: 13,
        title: "Pattern 13: Tree DFS - Recursive Preorder Traversal",
        problems: parseProblemsString("pat-13", "100. Same Tree, 101. Symmetric Tree, 105. Construct Binary Tree from Preorder and Inorder Traversal, 114. Flatten Binary Tree to Linked List, 226. Invert Binary Tree, 257. Binary Tree Paths, 988. Smallest String Starting From Leaf"),
      },
      {
        id: "pat-14",
        patternNumber: 14,
        title: "Pattern 14: Tree DFS - Recursive Inorder Traversal",
        problems: parseProblemsString("pat-14", "94. Binary Tree Inorder Traversal, 98. Validate Binary Search Tree, 173. Binary Search Tree Iterator, 230. Kth Smallest Element in a BST, 501. Find Mode in Binary Search Tree, 530. Minimum Absolute Difference in BST"),
      },
      {
        id: "pat-15",
        patternNumber: 15,
        title: "Pattern 15: Tree DFS - Recursive Postorder Traversal",
        problems: parseProblemsString("pat-15", "104. Maximum Depth of Binary Tree, 110. Balanced Binary Tree, 124. Binary Tree Maximum Path Sum, 145. Binary Tree Postorder Traversal, 337. House Robber III, 366. Find Leaves of Binary Tree, 543. Diameter of Binary Tree, 863. All Nodes Distance K in Binary Tree, 1110. Delete Nodes And Return Forest, 2458. Height of Binary Tree After Subtree Removal Queries"),
      },
      {
        id: "pat-17",
        patternNumber: 17,
        title: "Pattern 17: Tree - Lowest Common Ancestor (LCA) Finding",
        problems: parseProblemsString("pat-17", "235. Lowest Common Ancestor of a Binary Search Tree, 236. Lowest Common Ancestor of a Binary Tree"),
      },
      {
        id: "pat-18",
        patternNumber: 18,
        title: "Pattern 18: Tree - Serialization and Deserialization",
        problems: parseProblemsString("pat-18", "297. Serialize and Deserialize Binary Tree, 572. Subtree of Another Tree, 652. Find Duplicate Subtrees"),
      },
    ],
  },
  {
    id: "group-4",
    romanId: "IV",
    groupTitle: "IV. Graph Traversal Patterns (DFS & BFS)",
    shortName: "Graphs (DFS, BFS & DSU)",
    patternCount: 8,
    problemCount: 42,
    patterns: [
      {
        id: "pat-19",
        patternNumber: 19,
        title: "Pattern 19: Graph DFS - Connected Components / Island Counting",
        problems: parseProblemsString("pat-19", "130. Surrounded Regions, 200. Number of Islands, 417. Pacific Atlantic Water Flow, 547. Number of Provinces, 695. Max Area of Island, 733. Flood Fill, 841. Keys and Rooms, 1020. Number of Enclaves, 1254. Number of Closed Islands, 1905. Count Sub Islands, 2101. Detonate the Maximum Bombs"),
      },
      {
        id: "pat-20",
        patternNumber: 20,
        title: "Pattern 20: Graph BFS - Connected Components / Island Counting",
        problems: parseProblemsString("pat-20", "127. Word Ladder, 542. 01 Matrix, 994. Rotting Oranges, 1091. Shortest Path in Binary Matrix"),
      },
      {
        id: "pat-21",
        patternNumber: 21,
        title: "Pattern 21: Graph DFS - Cycle Detection (Directed Graph)",
        problems: parseProblemsString("pat-21", "207. Course Schedule, 210. Course Schedule II, 802. Find Eventual Safe States, 1059. All Paths from Source Lead to Destination"),
      },
      {
        id: "pat-22",
        patternNumber: 22,
        title: "Pattern 22: Graph BFS - Topological Sort (Kahn's Algorithm)",
        problems: parseProblemsString("pat-22", "207. Course Schedule, 210. Course Schedule II, 269. Alien Dictionary, 310. Minimum Height Trees, 444. Sequence Reconstruction, 1136. Parallel Courses, 1857. Largest Color Value in a Directed Graph, 2050. Parallel Courses III, 2115. Find All Possible Recipes from Given Supplies, 2392. Build a Matrix With Conditions"),
      },
      {
        id: "pat-23",
        patternNumber: 23,
        title: "Pattern 23: Graph - Deep Copy / Cloning",
        problems: parseProblemsString("pat-23", "133. Clone Graph"),
      },
      {
        id: "pat-24",
        patternNumber: 24,
        title: "Pattern 24: Graph - Shortest Path (Dijkstra's Algorithm)",
        problems: parseProblemsString("pat-24", "743. Network Delay Time, 778. Swim in Rising Water, 1514. Path with Maximum Probability, 1631. Path With Minimum Effort, 1976. Number of Ways to Arrive at Destination, 2045. Second Minimum Time to Reach Destination, 2203. Minimum Weighted Subgraph With the Required Paths, 2290. Minimum Obstacle Removal to Reach Corner, 2577. Minimum Time to Visit a Cell In a Grid, 2812. Find the Safest Path in a Grid"),
      },
      {
        id: "pat-25",
        patternNumber: 25,
        title: "Pattern 25: Graph - Shortest Path (Bellman-Ford / BFS+K)",
        problems: parseProblemsString("pat-25", "787. Cheapest Flights Within K Stops"),
      },
      {
        id: "pat-26",
        patternNumber: 26,
        title: "Pattern 26: Graph - Union-Find (Disjoint Set Union - DSU)",
        problems: parseProblemsString("pat-26", "200. Number of Islands, 261. Graph Valid Tree, 305. Number of Islands II, 323. Number of Connected Components in an Undirected Graph, 547. Number of Provinces, 684. Redundant Connection, 721. Accounts Merge, 737. Sentence Similarity II, 947. Most Stones Removed with Same Row or Column, 952. Largest Component Size by Common Factor, 959. Regions Cut By Slashes, 1101. The Earliest Moment When Everyone Become Friends"),
      },
    ],
  },
  {
    id: "group-5",
    romanId: "V",
    groupTitle: "V. Dynamic Programming (DP) Patterns",
    shortName: "Dynamic Programming",
    patternCount: 11,
    problemCount: 35,
    patterns: [
      {
        id: "pat-27",
        patternNumber: 27,
        title: "Pattern 27: DP - 1D Array (Fibonacci Style)",
        problems: parseProblemsString("pat-27", "70. Climbing Stairs, 91. Decode Ways, 198. House Robber, 213. House Robber II, 337. House Robber III, 509. Fibonacci Number, 740. Delete and Earn, 746. Min Cost Climbing Stairs"),
      },
      {
        id: "pat-28",
        patternNumber: 28,
        title: "Pattern 28: DP - 1D Array (Kadane's Algorithm for Max/Min Subarray)",
        problems: parseProblemsString("pat-28", "53. Maximum Subarray"),
      },
      {
        id: "pat-29",
        patternNumber: 29,
        title: "Pattern 29: DP - 1D Array (Coin Change / Unbounded Knapsack Style)",
        problems: parseProblemsString("pat-29", "322. Coin Change, 377. Combination Sum IV, 518. Coin Change II"),
      },
      {
        id: "pat-30",
        patternNumber: 30,
        title: "Pattern 30: DP - 1D Array (0/1 Knapsack Subset Sum Style)",
        problems: parseProblemsString("pat-30", "416. Partition Equal Subset Sum, 494. Target Sum"),
      },
      {
        id: "pat-31",
        patternNumber: 31,
        title: "Pattern 31: DP - 1D Array (Word Break Style)",
        problems: parseProblemsString("pat-31", "139. Word Break, 140. Word Break II"),
      },
      {
        id: "pat-32",
        patternNumber: 32,
        title: "Pattern 32: DP - 2D Array (Longest Common Subsequence - LCS)",
        problems: parseProblemsString("pat-32", "583. Delete Operation for Two Strings, 1143. Longest Common Subsequence"),
      },
      {
        id: "pat-33",
        patternNumber: 33,
        title: "Pattern 33: DP - 2D Array (Edit Distance / Levenshtein Distance)",
        problems: parseProblemsString("pat-33", "72. Edit Distance"),
      },
      {
        id: "pat-34",
        patternNumber: 34,
        title: "Pattern 34: DP - 2D Array (Unique Paths on Grid)",
        problems: parseProblemsString("pat-34", "62. Unique Paths, 63. Unique Paths II, 64. Minimum Path Sum, 120. Triangle, 221. Maximal Square, 931. Minimum Falling Path Sum, 1277. Count Square Submatrices with All Ones"),
      },
      {
        id: "pat-35",
        patternNumber: 35,
        title: "Pattern 35: DP - Interval DP",
        problems: parseProblemsString("pat-35", "312. Burst Balloons, 546. Remove Boxes"),
      },
      {
        id: "pat-36",
        patternNumber: 36,
        title: "Pattern 36: DP - Catalan Numbers",
        problems: parseProblemsString("pat-36", "95. Unique Binary Search Trees II, 96. Unique Binary Search Trees, 241. Different Ways to Add Parentheses"),
      },
      {
        id: "pat-37",
        patternNumber: 37,
        title: "Pattern 37: DP - Longest Increasing Subsequence (LIS)",
        problems: parseProblemsString("pat-37", "300. Longest Increasing Subsequence, 354. Russian Doll Envelopes, 1671. Minimum Number of Removals to Make Mountain Array, 2407. Longest Increasing Subsequence II"),
      },
    ],
  },
  {
    id: "group-6",
    romanId: "VI",
    groupTitle: "VI. Heap (Priority Queue) Patterns",
    shortName: "Heaps / Priority Queue",
    patternCount: 4,
    problemCount: 22,
    patterns: [
      {
        id: "pat-38",
        patternNumber: 38,
        title: "Pattern 38: Heap - Top K Elements (Selection/Frequency)",
        problems: parseProblemsString("pat-38", "215. Kth Largest Element in an Array, 347. Top K Frequent Elements, 451. Sort Characters By Frequency, 506. Relative Ranks, 703. Kth Largest Element in a Stream, 973. K Closest Points to Origin, 1046. Last Stone Weight, 2558. Take Gifts From the Richest Pile"),
      },
      {
        id: "pat-39",
        patternNumber: 39,
        title: "Pattern 39: Heap - Two Heaps for Median Finding",
        problems: parseProblemsString("pat-39", "295. Find Median from Data Stream, 1825. Finding MK Average"),
      },
      {
        id: "pat-40",
        patternNumber: 40,
        title: "Pattern 40: Heap - K-way Merge",
        problems: parseProblemsString("pat-40", "23. Merge k Sorted Lists, 373. Find K Pairs with Smallest Sums, 378. Kth Smallest Element in a Sorted Matrix, 632. Smallest Range Covering Elements from K Lists"),
      },
      {
        id: "pat-41",
        patternNumber: 41,
        title: "Pattern 41: Heap - Scheduling / Minimum Cost (Greedy with Priority Queue)",
        problems: parseProblemsString("pat-41", "253. Meeting Rooms II, 767. Reorganize String, 857. Minimum Cost to Hire K Workers, 1642. Furthest Building You Can Reach, 1792. Maximum Average Pass Ratio, 1834. Single-Threaded CPU, 1942. The Number of the Smallest Unoccupied Chair, 2402. Meeting Rooms III"),
      },
    ],
  },
  {
    id: "group-7",
    romanId: "VII",
    groupTitle: "VII. Backtracking Patterns",
    shortName: "Backtracking",
    patternCount: 7,
    problemCount: 16,
    patterns: [
      {
        id: "pat-42",
        patternNumber: 42,
        title: "Pattern 42: Backtracking - Subsets (Include/Exclude)",
        problems: parseProblemsString("pat-42", "17. Letter Combinations of a Phone Number, 77. Combinations, 78. Subsets, 90. Subsets II"),
      },
      {
        id: "pat-43",
        patternNumber: 43,
        title: "Pattern 43: Backtracking - Permutations",
        problems: parseProblemsString("pat-43", "31. Next Permutation, 46. Permutations, 60. Permutation Sequence"),
      },
      {
        id: "pat-44",
        patternNumber: 44,
        title: "Pattern 44: Backtracking - Combination Sum",
        problems: parseProblemsString("pat-44", "39. Combination Sum, 40. Combination Sum II"),
      },
      {
        id: "pat-45",
        patternNumber: 45,
        title: "Pattern 45: Backtracking - Parentheses Generation",
        problems: parseProblemsString("pat-45", "22. Generate Parentheses, 301. Remove Invalid Parentheses"),
      },
      {
        id: "pat-46",
        patternNumber: 46,
        title: "Pattern 46: Backtracking - Word Search / Path Finding in Grid",
        problems: parseProblemsString("pat-46", "79. Word Search, 212. Word Search II, 2018. Check if Word Can Be Placed In Crossword"),
      },
      {
        id: "pat-47",
        patternNumber: 47,
        title: "Pattern 47: Backtracking - N-Queens / Constraint Satisfaction",
        problems: parseProblemsString("pat-47", "37. Sudoku Solver, 51. N-Queens"),
      },
      {
        id: "pat-48",
        patternNumber: 48,
        title: "Pattern 48: Backtracking - Palindrome Partitioning",
        problems: parseProblemsString("pat-48", "131. Palindrome Partitioning"),
      },
    ],
  },
  {
    id: "group-8",
    romanId: "VIII",
    groupTitle: "VIII. Greedy Patterns",
    shortName: "Greedy Algorithms",
    patternCount: 5,
    problemCount: 11,
    patterns: [
      {
        id: "pat-49",
        patternNumber: 49,
        title: "Pattern 49: Greedy - Interval Merging/Scheduling",
        problems: parseProblemsString("pat-49", "56. Merge Intervals, 57. Insert Interval, 759. Employee Free Time, 986. Interval List Intersections, 2406. Divide Intervals Into Minimum Number of Groups"),
      },
      {
        id: "pat-51",
        patternNumber: 51,
        title: "Pattern 51: Greedy - Jump Game Reachability/Minimization",
        problems: parseProblemsString("pat-51", "45. Jump Game II, 55. Jump Game"),
      },
      {
        id: "pat-52",
        patternNumber: 52,
        title: "Pattern 52: Greedy - Buy/Sell Stock",
        problems: parseProblemsString("pat-52", "121. Best Time to Buy and Sell Stock, 122. Best Time to Buy and Sell Stock II"),
      },
      {
        id: "pat-53",
        patternNumber: 53,
        title: "Pattern 53: Greedy - Gas Station Circuit",
        problems: parseProblemsString("pat-53", "134. Gas Station"),
      },
      {
        id: "pat-54",
        patternNumber: 54,
        title: "Pattern 54: Greedy - Task Scheduling (Frequency Based)",
        problems: parseProblemsString("pat-54", "621. Task Scheduler"),
      },
    ],
  },
  {
    id: "group-9",
    romanId: "IX",
    groupTitle: "IX. Binary Search Patterns",
    shortName: "Binary Search",
    patternCount: 5,
    problemCount: 25,
    patterns: [
      {
        id: "pat-55",
        patternNumber: 55,
        title: "Pattern 55: Binary Search - On Sorted Array/List",
        problems: parseProblemsString("pat-55", "35. Search Insert Position, 69. Sqrt(x), 74. Search a 2D Matrix, 278. First Bad Version, 374. Guess Number Higher or Lower, 540. Single Element in a Sorted Array, 704. Binary Search, 1539. Kth Missing Positive Number"),
      },
      {
        id: "pat-56",
        patternNumber: 56,
        title: "Pattern 56: Binary Search - Find Min/Max in Rotated Sorted Array",
        problems: parseProblemsString("pat-56", "33. Search in Rotated Sorted Array, 81. Search in Rotated Sorted Array II, 153. Find Minimum in Rotated Sorted Array, 162. Find Peak Element, 852. Peak Index in a Mountain Array, 1095. Find in Mountain Array"),
      },
      {
        id: "pat-57",
        patternNumber: 57,
        title: "Pattern 57: Binary Search - On Answer / Condition Function",
        problems: parseProblemsString("pat-57", "410. Split Array Largest Sum, 774. Minimize Max Distance to Gas Station, 875. Koko Eating Bananas, 1011. Capacity To Ship Packages Within D Days, 1482. Minimum Number of Days to Make m Bouquets, 1760. Minimum Limit of Balls in a Bag, 2064. Minimized Maximum of Products Distributed to Any Store, 2226. Maximum Candies Allocated to K Children"),
      },
      {
        id: "pat-58",
        patternNumber: 58,
        title: "Pattern 58: Binary Search - Find First/Last Occurrence",
        problems: parseProblemsString("pat-58", "34. Find First and Last Position of Element in Sorted Array, 658. Find K Closest Elements"),
      },
      {
        id: "pat-59",
        patternNumber: 59,
        title: "Pattern 59: Binary Search - Median of Two Sorted Arrays",
        problems: parseProblemsString("pat-59", "4. Median of Two Sorted Arrays"),
      },
    ],
  },
  {
    id: "group-10",
    romanId: "X",
    groupTitle: "X. Stack Patterns",
    shortName: "Stack & Monotonic Stack",
    patternCount: 6,
    problemCount: 22,
    patterns: [
      {
        id: "pat-60",
        patternNumber: 60,
        title: "Pattern 60: Stack - Valid Parentheses Matching",
        problems: parseProblemsString("pat-60", "20. Valid Parentheses, 32. Longest Valid Parentheses, 921. Minimum Add to Make Parentheses Valid, 1249. Minimum Remove to Make Valid Parentheses, 1963. Minimum Number of Swaps to Make the String Balanced"),
      },
      {
        id: "pat-61",
        patternNumber: 61,
        title: "Pattern 61: Stack - Monotonic Stack",
        problems: parseProblemsString("pat-61", "402. Remove K Digits, 496. Next Greater Element I, 503. Next Greater Element II, 739. Daily Temperatures, 901. Online Stock Span, 907. Sum of Subarray Minimums, 962. Maximum Width Ramp, 1475. Final Prices With a Special Discount in a Shop, 1673. Find the Most Competitive Subsequence"),
      },
      {
        id: "pat-62",
        patternNumber: 62,
        title: "Pattern 62: Stack - Expression Evaluation (RPN/Infix)",
        problems: parseProblemsString("pat-62", "150. Evaluate Reverse Polish Notation, 224. Basic Calculator, 227. Basic Calculator II, 772. Basic Calculator III"),
      },
      {
        id: "pat-63",
        patternNumber: 63,
        title: "Pattern 63: Stack - Simulation / Backtracking Helper",
        problems: parseProblemsString("pat-63", "71. Simplify Path, 394. Decode String, 735. Asteroid Collision"),
      },
      {
        id: "pat-64",
        patternNumber: 64,
        title: "Pattern 64: Stack - Min Stack Design",
        problems: parseProblemsString("pat-64", "155. Min Stack"),
      },
      {
        id: "pat-65",
        patternNumber: 65,
        title: "Pattern 65: Stack - Largest Rectangle in Histogram",
        problems: parseProblemsString("pat-65", "84. Largest Rectangle in Histogram, 85. Maximal Rectangle"),
      },
    ],
  },
  {
    id: "group-11",
    romanId: "XI",
    groupTitle: "XI. Bit Manipulation Patterns",
    shortName: "Bit Manipulation",
    patternCount: 4,
    problemCount: 8,
    patterns: [
      {
        id: "pat-66",
        patternNumber: 66,
        title: "Pattern 66: Bitwise XOR - Finding Single/Missing Number",
        problems: parseProblemsString("pat-66", "136. Single Number, 137. Single Number II, 268. Missing Number, 389. Find the Difference"),
      },
      {
        id: "pat-67",
        patternNumber: 67,
        title: "Pattern 67: Bitwise AND - Counting Set Bits (Hamming Weight)",
        problems: parseProblemsString("pat-67", "191. Number of 1 Bits"),
      },
      {
        id: "pat-70",
        patternNumber: 70,
        title: "Pattern 70: Bitwise DP - Counting Bits Optimization",
        problems: parseProblemsString("pat-70", "338. Counting Bits"),
      },
      {
        id: "pat-69",
        patternNumber: 69,
        title: "Pattern 69: Bitwise Operations - Power of Two/Four Check",
        problems: parseProblemsString("pat-69", "231. Power of Two, 342. Power of Four"),
      },
    ],
  },
  {
    id: "group-12",
    romanId: "XII",
    groupTitle: "XII. Linked List Manipulation Patterns",
    shortName: "Linked List Manipulation",
    patternCount: 5,
    problemCount: 15,
    patterns: [
      {
        id: "pat-71",
        patternNumber: 71,
        title: "Pattern 71: Linked List - In-place Reversal",
        problems: parseProblemsString("pat-71", "83. Remove Duplicates from Sorted List, 92. Reverse Linked List II, 206. Reverse Linked List, 25. Reverse Nodes in k-Group, 234. Palindrome Linked List, 82. Remove Duplicates from Sorted List II"),
      },
      {
        id: "pat-72",
        patternNumber: 72,
        title: "Pattern 72: Linked List - Merging Two Sorted Lists",
        problems: parseProblemsString("pat-72", "21. Merge Two Sorted Lists"),
      },
      {
        id: "pat-73",
        patternNumber: 73,
        title: "Pattern 73: Linked List - Addition of Numbers",
        problems: parseProblemsString("pat-73", "2. Add Two Numbers, 369. Plus One Linked List"),
      },
      {
        id: "pat-74",
        patternNumber: 74,
        title: "Pattern 74: Linked List - Intersection Detection",
        problems: parseProblemsString("pat-74", "160. Intersection of Two Linked Lists"),
      },
      {
        id: "pat-75",
        patternNumber: 75,
        title: "Pattern 75: Linked List - Reordering / Partitioning",
        problems: parseProblemsString("pat-75", "24. Swap Nodes in Pairs, 61. Rotate List, 86. Partition List, 143. Reorder List, 328. Odd Even Linked List"),
      },
    ],
  },
  {
    id: "group-13",
    romanId: "XIII",
    groupTitle: "XIII. Array/Matrix Manipulation Patterns",
    shortName: "Array & Matrix",
    patternCount: 8,
    problemCount: 16,
    patterns: [
      {
        id: "pat-76",
        patternNumber: 76,
        title: "Pattern 76: Array/Matrix - In-place Rotation",
        problems: parseProblemsString("pat-76", "48. Rotate Image, 189. Rotate Array"),
      },
      {
        id: "pat-77",
        patternNumber: 77,
        title: "Pattern 77: Array/Matrix - Spiral Traversal",
        problems: parseProblemsString("pat-77", "54. Spiral Matrix, 885. Spiral Matrix III, 2326. Spiral Matrix IV"),
      },
      {
        id: "pat-78",
        patternNumber: 78,
        title: "Pattern 78: Array/Matrix - Set Matrix Zeroes (In-place Marking)",
        problems: parseProblemsString("pat-78", "73. Set Matrix Zeroes"),
      },
      {
        id: "pat-79",
        patternNumber: 79,
        title: "Pattern 79: Array - Product Except Self (Prefix/Suffix Products)",
        problems: parseProblemsString("pat-79", "238. Product of Array Except Self"),
      },
      {
        id: "pat-80",
        patternNumber: 80,
        title: "Pattern 80: Array - Plus One (Handling Carry)",
        problems: parseProblemsString("pat-80", "66. Plus One"),
      },
      {
        id: "pat-81",
        patternNumber: 81,
        title: "Pattern 81: Array - Merge Sorted Array (In-place from End)",
        problems: parseProblemsString("pat-81", "88. Merge Sorted Array"),
      },
      {
        id: "pat-82",
        patternNumber: 82,
        title: "Pattern 82: Array - Cyclic Sort",
        problems: parseProblemsString("pat-82", "41. First Missing Positive, 268. Missing Number, 287. Find the Duplicate Number, 442. Find All Duplicates in an Array, 448. Find All Numbers Disappeared in an Array"),
      },
      {
        id: "pat-83",
        patternNumber: 83,
        title: "Pattern 83: Array - Kadane's Variant for Maximum Product",
        problems: parseProblemsString("pat-83", "152. Maximum Product Subarray"),
      },
    ],
  },
  {
    id: "group-14",
    romanId: "XIV",
    groupTitle: "XIV. String Manipulation Patterns",
    shortName: "String Algorithms",
    patternCount: 7,
    problemCount: 15,
    patterns: [
      {
        id: "pat-84",
        patternNumber: 84,
        title: "Pattern 84: String - Palindrome Check (Two Pointers / Reverse)",
        problems: parseProblemsString("pat-84", "9. Palindrome Number, 125. Valid Palindrome, 680. Valid Palindrome II"),
      },
      {
        id: "pat-85",
        patternNumber: 85,
        title: "Pattern 85: String - Anagram Check (Frequency Count/Sort)",
        problems: parseProblemsString("pat-85", "49. Group Anagrams, 242. Valid Anagram"),
      },
      {
        id: "pat-86",
        patternNumber: 86,
        title: "Pattern 86: String - Roman to Integer Conversion",
        problems: parseProblemsString("pat-86", "13. Roman to Integer"),
      },
      {
        id: "pat-87",
        patternNumber: 87,
        title: "Pattern 87: String - String to Integer (atoi)",
        problems: parseProblemsString("pat-87", "8. String to Integer (atoi)"),
      },
      {
        id: "pat-88",
        patternNumber: 88,
        title: "Pattern 88: String - Multiply Strings (Manual Simulation)",
        problems: parseProblemsString("pat-88", "43. Multiply Strings"),
      },
      {
        id: "pat-89",
        patternNumber: 89,
        title: "Pattern 89: String Matching - Naive / KMP / Rabin-Karp",
        problems: parseProblemsString("pat-89", "28. Find the Index of the First Occurrence in a String, 214. Shortest Palindrome, 686. Repeated String Match, 796. Rotate String, 3008. Find Beautiful Indices in the Given Array II"),
      },
      {
        id: "pat-90",
        patternNumber: 90,
        title: "Pattern 90: String - Repeated Substring Pattern Detection",
        problems: parseProblemsString("pat-90", "459. Repeated Substring Pattern"),
      },
    ],
  },
  {
    id: "group-15",
    romanId: "XV",
    groupTitle: "XV. Design Patterns",
    shortName: "System & Class Design",
    patternCount: 1,
    problemCount: 36,
    patterns: [
      {
        id: "pat-91",
        patternNumber: 91,
        title: "Pattern 91: Design (General/Specific)",
        problems: parseProblemsString("pat-91", "146. LRU Cache, 155. Min Stack, 208. Implement Trie (Prefix Tree), 211. Design Add and Search Words Data Structure, 225. Implement Stack using Queues, 232. Implement Queue using Stacks, 251. Flatten 2D Vector, 271. Encode and Decode Strings, 295. Find Median from Data Stream, 341. Flatten Nested List Iterator, 346. Moving Average from Data Stream, 353. Design Snake Game, 359. Logger Rate Limiter, 362. Design Hit Counter, 379. Design Phone Directory, 380. Insert Delete GetRandom O(1), 432. All O`one Data Structure, 460. LFU Cache, 604. Design Compressed String Iterator, 622. Design Circular Queue, 641. Design Circular Deque, 642. Design Search Autocomplete System, 706. Design HashMap, 715. Range Module, 900. RLE Iterator, 981. Time Based Key-Value Store, 1146. Snapshot Array, 1348. Tweet Counts Per Frequency, 1352. Product of the Last K Numbers, 1381. Design a Stack With Increment Operation, 1756. Design Most Recently Used Queue, 2013. Detect Squares, 2034. Stock Price Fluctuation, 2296. Design a Text Editor, 2336. Smallest Number in Infinite Set"),
      },
    ],
  },
];

export const TOTAL_360_PROBLEMS_COUNT = LEETCODE_360_PATTERN_GROUPS.reduce(
  (acc, g) => acc + g.patterns.reduce((pAcc, p) => pAcc + p.problems.length, 0),
  0
);
