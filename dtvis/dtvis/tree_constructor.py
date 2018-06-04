from collections import deque, defaultdict
from itertools import product
import numpy as np
import re, json

class D3Tree:
    
    def __init__(self,clf,feature_names, class_labels, node_type = 'leaf-pie', colors = 'default'):
        '''
        node_type: string, three options either: 'all-pie', 'leaf-pie' or 'no-pie' to plot the all 
        of the nodes as pie charts, only the leaf nodes as pie charts or do not plot pie charts at all, respectively.
        '''
        self.clf = clf
        self.feature_names = feature_names
        self.class_labels = class_labels
        self.colors = colors
        self.node_type = node_type
        self.tree = {}
        self.decision_paths = {}
        self.importances = []
    
    def reconstruct(self):      
        '''
        self.colors: A list whose length equals the number of classes in the classification problem. If "default", 
        the colors are imported from brewer2mpl Dark2 qualitative scheme. 
        '''
        if self.colors == 'default':
            from brewer2mpl import qualitative
            num_classes = len(self.clf.classes_)
            if num_classes < 3:
                num_classes = 3
            temp_colors = qualitative.Dark2[num_classes].hex_colors
            self.colors = temp_colors[:len(self.clf.classes_)]
        self.tree['data'], self.leaves, self.leaf_values = reconstruct_tree(self.clf, self.feature_names, self.colors)
    
    def options(self, class_labels, display_tooltip = 'show'):
        '''Pass options to the D3 visualization.
        
        Parameters:
        -----------
        class_labels: a list of class labels,
        display_tooltip: 'show' (default) if there should be a tooltip for the visualization.
        The other parameters can be changed as well if a user wants to print a different name, for example,
        for the values of the decision tree but then the corresponding arguments need to be changed in the
        reconstruct_tree method as well.
        '''
        self.tree['opts'] = {
          "classLabels": class_labels,
          "childrenName": "children", 
          "id": "id", 
          "maxLabelLength": 15, 
          "name": "label", 
          "nodeHeight": None, 
          "tooltip": display_tooltip,
          "value": "samples",
          "nodeType": self.node_type,
          "colors": self.colors
        }
    def decision_path(self):
        def build_decision_path(node, path, direction):
            if node is None:
                return
            this_node = node['label']
            if direction == "right":
                this_node = re.sub("\u2264", ">" , this_node) 
            path.append(this_node)
            try:
                child1, child2 = node['children']
            except KeyError:
                self.decision_paths[node['label']] = path
                return
            else:
                build_decision_path(child1, list(path),'left')
                build_decision_path(child2, list(path),'right')

        # traverse the tree starting from the root node
        build_decision_path(self.leaves[0], [], 'left')

        
    def importance(self):
        for feature, importance in zip(self.feature_names, self.clf.feature_importances_):
            self.importances.append({'attribute': feature, 'importance': importance})
    
    def export_data(self, path = 'data/',filename='d3tree_data.json'):
        self.reconstruct()
        self.options(self.class_labels)
        self.decision_path()
        self.importance()
        json_out = {'evals': [],
            'jsHooks': [],
            'x': self.tree,
            'importances': self.importances, 
            'decision_paths': self.decision_paths, 
            'leaf_values': self.leaf_values}
        with open(path + filename, 'w') as fp:
            json.dump(json_out, fp, indent = 4)

def reconstruct_tree(clf, feature_names, colors):
    '''Construct a hierarchical tree for plotting with d3.layout.tree from a scikit-learn DecisionTreeClassifier.
    
    Parameters:
    -----------
    clf: DecisionTreeClassifier object.
    feature_names: A list of the names of the features that were fitted with the DecisionTreeClassifier.
    
    Returns:
    --------
    A dict representing the tree in a nested format.
    '''
    
    # data for reconstructing the tree
    features = clf.tree_.feature
    n_samples = clf.tree_.n_node_samples
    feature_names = feature_names
    values = clf.tree_.value # is it weighted?
    thresholds = np.round(clf.tree_.threshold,2)
    impurities = np.round(clf.tree_.impurity, 3)

    # set containers
    leaves = deque()
    nodes = []

    # save also the leaves with values for the decision path queries
    leaf_values = {}


    # helper functions
    def value_getter(arr):
        return [int(v) for v in arr[0]]

    # count the leaf nodes in the tree in order to return a little bit nicer formatted output
    n_leaf = sum([feature == -2 for feature in features])

    # build the tree in a bottom-up approach
    for n, feature in enumerate(reversed(features)):
        this_value = value_getter(values[-(n+1)])
        this_label = feature_names[feature] + ' \u2264 ' + str(thresholds[-(n+1)])
        this_impurity = impurities[-(n+1)]
        # if it is a leaf node, append it to leaves and give it a name
        if feature == -2:
            label_leaf = 'leaf' + str(n_leaf)
            leaf_values[label_leaf] = this_value
            leaf = {'label': label_leaf, 'samples': sum(this_value), 'n_obs': this_value,
                    'color': colors[np.argmax(this_value)], 'impurity': this_impurity}
            leaves.append(leaf)
            n_leaf -= 1
            this_label = label_leaf
        # if it is a node, append it to the tree
        else:
            # add left and right children to the stack
            child1=leaves.pop()
            child2=leaves.pop()
            # temporary stack to store the children
            temp_leaves = []
            # and the nodes 
            temp_node_leaves = {'label': this_label , 'samples': sum(this_value), 
                                'n_obs': this_value, 'color': colors[np.argmax(this_value)], 
                                'impurity': this_impurity}
            temp_leaves.append(child1)
            temp_leaves.append(child2)
            temp_node_leaves['children'] = temp_leaves
            leaves.append(temp_node_leaves)
    return [temp_node_leaves, leaves, leaf_values]