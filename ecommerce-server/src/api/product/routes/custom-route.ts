module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/students',
      handler: 'custom-controller.createStudent',
    },
  ],
};