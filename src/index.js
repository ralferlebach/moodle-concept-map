import {h, bind} from 'funponent/src/funponent';
import './drag-drop-touch';

const theme = {
  edgeBorder: '1px solid #666',
  edgeBorderDragging: '1px dashed #666',
  edgeLabelBackground: 'rgba(255, 255, 255, 0.8)',
  vertexBackground: 'white',
  vertexBorder: '1px solid #999',
  vertexBorderRadius: '5px',
};

const lineTransform = (x1, y1, x2, y2, units) => {
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  let angle = Math.acos(deltaX / length);
  if (deltaY < 0) {
    angle = -angle;
  }
  return {
    transform: `rotate(${angle}rad)`,
    width: `${length}${units}`,
  };
};

const vertex = data => {
  const {
    id,
    label,
    left,
    top,
  } = data;

  return (
    <div
      data-id={id}
      draggable={'true'}
      className={'Vertex'}
      style={{
        background: theme.vertexBackground,
        border: theme.vertexBorder,
        borderRadius: theme.vertexBorderRadius,
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        padding: '0.5em 1em',
        transform: 'translate(-50%, -50%)',
        zIndex: 1,
      }}>
      <span
        style={'cursor: text'}>{label}</span>
    </div>
  );
};

const edge = data => {
  const {
    from,
    label,
    to,
  } = data;

  const units = 'px';
  const edgeThickness = '10';
  const width = to.left - from.left;
  const height = to.top - from.top;
  const labelLeft = from.left + width / 2;
  const labelTop = from.top + height / 2;

  return (
    <div>
      <div
        className={'Edge'}
        style={{
          left: `${from.left}${units}`,
          top: `${from.top}${units}`,
          height: `${edgeThickness}${units}`,
          ...lineTransform(from.left, from.top, to.left, to.top, units),
        }} />
      <div
        style={{
          background: theme.edgeLabelBackground,
          position: 'absolute',
          left: `${labelLeft}${units}`,
          top: `${labelTop}${units}`,
          transform: 'translate(-50%, -50%)',
        }}>
        {label}
      </div>
    </div>
  );
};

const helpPane = (
  <ul style={{
    fontSize: '60%',
    listStyleType: 'none',
    margin: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  }}>
    <li>Double-tap map to add node</li>
    <li>Tap a node to select</li>
    <li>Drag a node to move</li>
    <li>Drag selected node connector circle to another node to create edge</li>
    <li>Double-tap a node to edit, empty label to delete</li>
  </ul>
);

const conceptMap = data => {
  const {
    edges,
    vertices,
  } = JSON.parse(data.config);

  const verticesById = vertices.reduce((result, item) => {
    result[item.id] = item;
    return result;
  }, {});

  return (
    <body>
      <div style={{position: 'relative'}}>
        {edges.map(item => edge({
          ...item,
          from: verticesById[item.from],
          to: verticesById[item.to],
        }))}

        {vertices.map(item => vertex(item))}

        {helpPane}
      </div>
    </body>
  );
};

conceptMap.init = node => {
  const getConfig = () => JSON.parse(node.dataset.config);
  const setConfig = config => node.dataset.config = JSON.stringify(config);;

  const events = {
    dblclick: event => {
      const config = getConfig();
      config.vertices.push({
        id: Math.random(),
        label: 'Untitled',
        left: event.offsetX,
        top: event.offsetY,
      });
      setConfig(config);
    },

    dragstart: event => {
      // async so only drag origin element is affected and not dragged screenshot
      setTimeout(() => event.target.style.border = theme.edgeBorderDragging);
    },

    dragend: event => {
      const target = event.target;
      const id = target.dataset.id;
      const config = getConfig();
      const vertex = config.vertices.filter(vertex => vertex.id == id)[0];
      vertex.left += event.offsetX;
      vertex.top += event.offsetY - target.clientHeight;
      setConfig(config);
    },
  };

  Object.keys(events).forEach(key => node.addEventListener(key, events[key]));
};

bind('.ConceptMap', conceptMap);
