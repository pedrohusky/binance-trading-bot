/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */

class SearchIcon extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchName: ''
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value =
      target.type === 'checkbox'
        ? target.checked
        : target.type === 'number'
          ? +target.value
          : target.value;

    let { searchName } = this.state;

    searchName = value.toUpperCase();

    this.setState({
      searchName
    });
    this.props.searchKeyword(searchName);
  }

  render() {
    return (
      <form class="search-container" onChange={this.handleInputChange}>
        <input id="search-box" type="text" class="search-box" onkeypress="return event.keyCode != 13;" />
        <label for="search-box"><span class="fa fa-search search-icon"></span></label>
        <input type="submit" id="search-submit" />
      </form>
    );
  }
}
