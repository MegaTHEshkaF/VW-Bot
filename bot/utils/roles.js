// Role functions
// Replace all role id's on roles, remove undefined
function getRoles(event, rolesId) {
    const roles = [];
    var i = 0
    rolesId.forEach(roleId => {
        const role = (event.guild) ? event.guild.roles.cache.find(r => r.id === roleId) : event.roles.cache.find(r => r.id === roleId);
        if(role) {
            roles[i] = role;
            i++;
        }
    });
    return roles;
}
// Add roles to member
function addRoles(event, roles) {
    event.member.roles.add(roles).catch(err => {
        // console.log(err);
        if(event.guild.systemChannel) event.guild.systemChannel.send('Bot can\'t add some role, because it\'s above it\'s role!');
    });
}
// Remove roles from member
function removeRoles(event, roles) {
    event.member.roles.remove(roles).catch(err => {
        // console.log(err);
        if(event.guild.systemChannel) event.guild.systemChannel.send('Bot can\'t remove some role, because it\'s above it\'s role!');
    });
}
// Check what roles member doesn't have
function checkRoles(event, roles) {
    const check = [true, []];
    var i = 0;
    roles.forEach(role => {
        if(!event.member.roles.cache.has(role)) {
            check[0] = false;
            check[1][i] = role;
            i++;
        }
    });
    return check;
}

module.exports = { getRoles, checkRoles, addRoles, removeRoles };