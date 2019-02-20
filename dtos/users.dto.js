const RolesDto = require("../dtos/roles.dto");
const PageMetaDto = require("./page_meta.dto");

function listBasic(users, page, pageSize, totalArticlesCount, basePath) {
    return {
        page_meta: PageMetaDto.build(page, pageSize, totalArticlesCount, basePath),
        users: users.map(user => user.getJsonSummary())
    }
}

function loginDto(user) {
    return {
        userName: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
//      roles: user.roles.map(r => r.name)
        token: user.generateJwt()
    }
}

function registerDto() {
    return {
        success: true,
        full_messages: ['User registered successfully']
    };
}

function loginSuccess(user) {
    return {
        success: true,
        token: user.generateJwt(),
        user: {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            roles: RolesDto.toNameList(user.roles),
        }
    }
}

function buildOnlyForIdAndUsername(user) {
    if (user == null)
        return {};
    return {
        id: user.id,
        username: user.username
    }
}

module.exports = {
    listBasic,
    registerDto, loginSuccess, buildOnlyForIdAndUsername
};