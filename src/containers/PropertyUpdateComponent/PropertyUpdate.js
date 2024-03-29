import React from "react";
import PropTypes from "prop-types";
import {
  Form,
  Input,
  Button,
  Result,
  Card,
  Badge,
  Space,
  Row,
  Col,
  Select,
  Switch,
} from "antd";
import { Redirect } from "react-router-dom";
import { status, json } from "../../core/utilities/requestHandlers";
import config from "../../core/config.json";
import StyledSpin from "../../components/StyledSpinComponent/StyledSpin";
import {
  titleProps,
  descriptionProps,
  locationProps,
  categoryProps,
  featuresProps,
  askingPriceProps,
  visibleProps,
  highPriorityProps,
  underOfferProps,
} from "../../core/utilities/propertiesFormProps";

const { Option } = Select;

/**
 * Stateful component
 * @class PropertyUpdate
 * @extends {React.Component}
 */
class PropertyUpdate extends React.Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { id },
      },
    } = this.props;
    /**
     * @type {Object}
     * @property {String} id
     * @property {Boolean} successful
     * @property {Boolean} failed
     * @property {Boolean} loading
     */
    this.state = {
      id,
      successful: false,
      failed: false,
      loading: true,
    };
    this.loadProperty = this.loadProperty.bind(this);
    this.loadFeatures = this.loadFeatures.bind(this);
    this.loadCategories = this.loadCategories.bind(this);
  }

  /**
   * Calls API and loads state with response data
   */
  componentDidMount() {
    this.loadProperty();
    this.loadFeatures();
    this.loadCategories();
    this.setState({ loading: false });
  }

  /**
   * Checks if a property was successfully updated, and if so
   * sets a timer for 1 second and then redirects the user back to
   * their 'My Properties' page
   */
  componentDidUpdate() {
    const { successful } = this.state;
    if (successful)
      this.redir = setTimeout(
        () => this.setState({ successful: false, redirect: true }),
        1000
      );
  }

  /**
   * Clears the timeout created by 'componentDidUpdate'
   */
  componentWillUnmount() {
    clearTimeout(this.redir);
  }

  /**
   * Form submission function
   * Takes data from the 'updateProperty' form and from
   * props and uses it to make an API PUT request
   * @param {Object} values
   * @memberof Property
   */
  onFinish = (values) => {
    const { id } = this.state;
    const {
      user: { token },
    } = this.props;
    let { ...data } = values;
    data = {
      ...data,
      askingPrice: parseInt(data.askingPrice, 10),
      dateUpdated: Date.now(),
    };
    fetch(`${config.BACK_END_URL}/api/properties/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(status)
      .then(() => {
        this.setState({ successful: true });
      })
      .catch(() => {
        this.setState({ failed: true });
      });
  };

  /**
   * Makes a request to the API for the property details
   * @memberof Property
   */
  loadProperty() {
    const { id } = this.state;
    fetch(`${config.BACK_END_URL}/api/properties/get/${id}`, {
      method: "GET",
    })
      .then(status)
      .then(json)
      .then((response) => {
        if (response._id) {
          this.setState({
            property: response,
          });
        } else this.setState({ failed: true });
      })
      .catch(() => {
        this.setState({ failed: true });
      });
  }

  /**
   * Makes a request to the API for all property features
   * @memberof Property
   */
  loadFeatures() {
    fetch(`${config.BACK_END_URL}/api/properties/features/`, {
      method: "GET",
    })
      .then(status)
      .then(json)
      .then((response) => {
        this.setState({
          features: response,
          redirect: false,
        });
      })
      .catch(() => {
        this.setState({ failed: true });
      });
  }

  /**
   * Makes a request to the API for all property categories
   * @memberof Property
   */
  loadCategories() {
    fetch(`${config.BACK_END_URL}/api/properties/categories/`, {
      method: "GET",
    })
      .then(status)
      .then(json)
      .then((response) => {
        this.setState({
          categories: response,
        });
      })
      .catch(() => {
        this.setState({ failed: true });
      });
  }

  /**
   * Renders the 'PropertyUpdate' component
   * Whilst the API call is being made and the response is being validated, show a spinning circle
   * If the call succeeds, show a 'success' message and redirect the user back to their 'My Properties' page
   * If the call fails, show an 'error' message
   * @memberof Property
   */
  render() {
    // Destructuring assignment for variables stored in 'propertiesFormProps.js'
    const { rules: titleRules, tooltip: titleTooltip } = titleProps;
    const {
      rules: descriptionRules,
      tooltip: descriptionTooltip,
    } = descriptionProps;
    const { rules: locationRules, tooltip: locationTooltip } = locationProps;
    const {
      rules: askingPriceRules,
      tooltip: askingPriceTooltip,
    } = askingPriceProps;
    const { rules: categoryRules, tooltip: categoryTooltip } = categoryProps;
    const { rules: featuresRules, tooltip: featuresTooltip } = featuresProps;
    const {
      rules: visibleRules,
      tooltip: { title: visibleTooltip },
    } = visibleProps;
    const {
      rules: underOfferRules,
      tooltip: underOfferTooltip,
    } = underOfferProps;
    const {
      rules: highPriorityRules,
      tooltip: highPriorityTooltip,
    } = highPriorityProps;
    const { failed, successful, redirect, loading } = this.state;

    // If the page is loading, show a StyledSpin component
    if (loading) {
      return <StyledSpin />;
    }

    // If the property couldn't be updated, show error message
    if (failed) {
      return (
        <Result
          status="error"
          title="Login failed."
          subTitle="There was an error validating your credentials."
          extra={
            <>
              <Button
                onClick={() => this.setState({ failed: false })}
                key="login"
              >
                Back
              </Button>
            </>
          }
        />
      );
    }

    // If the property was updated successfully, show success message
    if (successful) {
      return (
        <Result
          status="success"
          title="You successfully updated your property!"
          subTitle="We're redirecting you to the My Properties page..."
          extra={[<StyledSpin key={Math.random()} />]}
        />
      );
    }

    // Redirect back to 'My Properties' page after successful API request
    if (redirect) {
      return <Redirect to="/properties/own" />;
    }

    const { property } = this.state;

    // Render only when property data has been retrieved from API and loaded into state
    if (property !== undefined) {
      const {
        property: {
          title,
          location,
          underOffer,
          highPriority,
          askingPrice,
          description,
          visible,
          propertyFeatures,
          propertyCategory,
        },
        features,
        categories,
      } = this.state;

      const featureOptions = [];
      if (features) {
        features.map(({ _id: featureID, title: featureTitle }) =>
          featureOptions.push(
            <Option key={featureID} value={featureID}>
              {featureTitle}
            </Option>
          )
        );
      }

      const selectedFeatures = [];
      if (propertyFeatures) {
        propertyFeatures.map(({ _id }) => selectedFeatures.push(_id));
      }

      const categoryOptions = [];
      if (categories) {
        categories.map(({ _id: categoryID, title: categoryTitle }) =>
          categoryOptions.push(
            <Option key={categoryID} value={categoryID}>
              {categoryTitle}
            </Option>
          )
        );
      }

      let selectedCategory;
      if (propertyCategory) {
        const { _id } = propertyCategory;
        selectedCategory = _id;
      }

      return (
        <>
          <Form
            name="updateProperty"
            onFinish={this.onFinish}
            colon={false}
            initialValues={{
              title,
              description,
              location,
              visible,
              highPriority,
              underOffer,
            }}
          >
            <Row>
              <Col
                span={18}
                lg={{ span: 24 }}
                xl={{ span: 18 }}
                md={{ span: 24 }}
                sm={{ span: 24 }}
                xs={{ span: 24 }}
              >
                <Card
                  title={title}
                  extra={
                    <Space>
                      {highPriority ? (
                        <Badge dot text="High Priority" status="success" />
                      ) : null}
                      {underOffer ? (
                        <Badge dot text="Under Offer" status="processing" />
                      ) : null}
                    </Space>
                  }
                >
                  <Card type="inner" style={{ marginBottom: 10 }} title="Title">
                    <Form.Item
                      name="title"
                      rules={titleRules}
                      tooltip={titleTooltip}
                      label={" "}
                    >
                      <Input />
                    </Form.Item>
                  </Card>
                  <Card
                    type="inner"
                    style={{ marginBottom: 10 }}
                    title="Description"
                  >
                    <Form.Item
                      name="description"
                      rules={descriptionRules}
                      tooltip={descriptionTooltip}
                      label={" "}
                    >
                      <Input />
                    </Form.Item>
                  </Card>
                  <Card
                    type="inner"
                    style={{ marginBottom: 10 }}
                    title="Location"
                  >
                    <Form.Item
                      name="location"
                      rules={locationRules}
                      tooltip={locationTooltip}
                      label={" "}
                    >
                      <Input />
                    </Form.Item>
                  </Card>
                  <Card
                    type="inner"
                    style={{ marginBottom: 10 }}
                    title="Asking Price"
                  >
                    <Form.Item
                      name="askingPrice"
                      initialValue={String(askingPrice)}
                      rules={askingPriceRules}
                      tooltip={askingPriceTooltip}
                      label={" "}
                    >
                      <Input prefix="£" />
                    </Form.Item>
                  </Card>
                  <Card
                    type="inner"
                    style={{ marginBottom: 10 }}
                    title="Category"
                  >
                    <Form.Item
                      name="propertyCategory"
                      initialValue={selectedCategory}
                      rules={categoryRules}
                      tooltip={categoryTooltip}
                      label={" "}
                    >
                      <Select placeholder="Property Category">
                        {categoryOptions}
                      </Select>
                    </Form.Item>
                  </Card>
                </Card>
              </Col>
              <Col
                span={6}
                lg={{ span: 24 }}
                xl={{ span: 6 }}
                md={{ span: 24 }}
                sm={{ span: 24 }}
                xs={{ span: 24 }}
              >
                <Card id="sideCard" title="Features">
                  <Form.Item
                    initialValue={selectedFeatures}
                    rules={featuresRules}
                    tooltip={featuresTooltip}
                    label={" "}
                    name="propertyFeatures"
                  >
                    <Select mode="multiple" placeholder="Property features">
                      {featureOptions}
                    </Select>
                  </Form.Item>
                </Card>
                <Card id="sideCard" title="Options">
                  <Card
                    type="inner"
                    style={{ marginBottom: 10 }}
                    title="Visible"
                  >
                    <Form.Item
                      name="visible"
                      rules={visibleRules}
                      tooltip={visibleTooltip}
                      label={" "}
                    >
                      <Switch defaultChecked={visible} />
                    </Form.Item>
                  </Card>
                  <Card
                    type="inner"
                    style={{ marginBottom: 10 }}
                    title="High Priority"
                  >
                    <Form.Item
                      name="highPriority"
                      rules={highPriorityRules}
                      tooltip={highPriorityTooltip}
                      label={" "}
                    >
                      <Switch defaultChecked={highPriority} />
                    </Form.Item>
                  </Card>
                  <Card
                    type="inner"
                    style={{ marginBottom: 10 }}
                    title="Under Offer"
                  >
                    <Form.Item
                      name="underOffer"
                      rules={underOfferRules}
                      tooltip={underOfferTooltip}
                      label={" "}
                    >
                      <Switch defaultChecked={underOffer} />
                    </Form.Item>
                  </Card>
                </Card>
                <Card id="sideCard">
                  <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                      Update
                    </Button>
                  </Form.Item>
                </Card>
              </Col>
            </Row>
          </Form>
        </>
      );
    }

    return <StyledSpin />;
  }
}

PropertyUpdate.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }),
  }),
  user: PropTypes.shape({
    token: PropTypes.string.isRequired,
  }),
};

export default PropertyUpdate;
