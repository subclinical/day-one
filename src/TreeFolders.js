import React from "react";
import { Treebeard } from "react-treebeard";
import { Base64 } from "js-base64";
import GitHub from "./GitHub.js";

let data = {
  name: "root",
  toggled: true,
  children: [
    {
      name: "parent",
      children: [{ name: "child1" }, { name: "child2" }]
    },
    {
      name: "loading parent",
      children: []
    },
    {
      name: "parent",
      children: [
        {
          name: "nested parent",
          children: [{ name: "nested child 1" }, { name: "nested child 2" }]
        }
      ]
    }
  ]
};

class TreeFolders extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      owner: "",
      loaded: false,
      data: {},
      cursor: {
        active: true
      }
    };
    this.onToggle = this.onToggle.bind(this);
  }

  //find parent node
  attachChildren(data, name, children) {
    if(data.children) {
    for(const i of data.children) {
      if(i.name === name) {
        i.children = children;
        console.log(data + 'found');
        return data;
      } else if(i.children) {
        console.log(data + 'data has children')
        this.attachChildren(i, name, children);
      }
    }
  } else {
    if(data.name === name) {
      console.log('data without children found' + data)
      data.children = children;
      return data;
    }
  }
    return false;
  }

  async onToggle(node, toggled) {
    if (this.state.cursor) {
      this.state.cursor.active = false;
    }
    console.log(node);
    node.active = true;
    if (node.children) {
      node.toggled = toggled;
      node.loading = true;
    }
    // if(node.fullName) {
    if(node.type !== 'file') {
    let children = await GitHub.accessElement(node.fullName, node.path);
      // } else {
        //   let children = await GitHub.accessElement(node.name, node.path);
        // }
    if(this.attachChildren(this.state.data, node.name, children)) {
      console.log('Loading children...');
      node.loading = false;
    } else {
      console.log('Unable to attach children to parent.');
      node.loading = false;
    }
  }
    this.setState({ cursor: node });
    // console.log("toggling (cursor):", this.state.cursor);
    // console.log("toggling (cursor.node):", this.state.cursor.node);
    // console.log("toggling (cursor.node.name):", this.state.cursor.node.name);
  }


  render() {
    if(!this.state.loaded && this.props.token) this.sync();
    return (
      <Treebeard
        data={this.state.data}
        onToggle={this.onToggle}
        className="tree-folders"
      />
    );
  }
  async sync() {
    this.setState({
      data: await GitHub.listRepos(this.props.token),
      loaded: true
    });
  }
}

export default TreeFolders;
