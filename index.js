// use-strict;
/* eslint-disable no-console,max-len */

const express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    axios = require('axios'),
    path = require('path'),
    ip = require('ip'),
    dns = require('node:dns'),
    isValidDomain = require('is-valid-domain'),

    app = express(),
    router = express.Router(),
    port = 3000,
    check_proto = /^(https?|http):\/\//;

// Configuring body parser middleware and CORS
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function errorHandler (asyncRouteHandler) {
    return async function (req, res, next) {
        try {
            return await asyncRouteHandler(req, res, next);
        }
        catch (e) {
            console.log(e);

            return res.status(500).send('Something went wrong');
        }
    };
}

/**
 * Better way to parse the URL and get hostname.
 * As it takes care of encoded IP address
 * It use URL constructor and return hostname
 *
 * @param  {string} url description
 * @return {string}     description
 */
const getHostname = function (url) {
    return new URL(url).hostname;
};

/**
 * Crapier way of parsing URL to get host name. It does not take care of encoded IP format
 *
 * @param  {string} href description
 * @return {object}      description
 */
function getLocation (href) {
    // eslint-disable-next-line no-useless-escape
    const match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);

    return match && {
        href: href,
        protocol: match[1],
        host: match[2],
        hostname: match[3],
        port: match[4],
        pathname: match[5],
        search: match[6],
        hash: match[7]
    };
}

/**
* Checks if resolved IP address belongs to private ip range
* `ip.isPrivate()` does not coved all the Possibility of private IP
* hence using our own list of "private" CIDRs
*/
const privateCIDRs = [
    '0.0.0.0/8',
    '10.0.0.0/8',
    '100.64.0.0/10',
    '127.0.0.0/8',
    '169.254.0.0/16',
    '172.16.0.0/12',
    '192.0.0.0/29',
    '192.0.0.170/31',
    '192.0.2.0/24',
    '192.88.99.0/24',
    '192.168.0.0/16',
    '198.18.0.0/15',
    '198.51.100.0/24',
    '203.0.113.0/24',
    '224.0.0.0/4',
    '240.0.0.0/4',
    '255.255.255.255/32'
].map(ip.cidrSubnet);

/**
 * isPrivateIP - description
 *
 * @param  {string} ip_addr description
 * @return {boolean}         description
 */
function isPrivateIP (ip_addr) {
    // Directly checks the IP address against privateCIDR
    return privateCIDRs.some((cidr) => { return cidr.contains(ip_addr); });
}

/**
 * lookupPromise - Resolve IP address from DNS Asynchronously
 *
 * @param  {string} hostname description
 * @return {object}          description
 */
function lookupPromise (hostname) {
    console.log(`I am here!! IN DNS Module ${hostname}`)
    return new Promise((resolve, reject) => {
        dns.lookup(hostname, (err, address, family) => {
            if (err) { reject(err); }
            resolve(address);
        });
    });
}

/**
 * root route handler
 *
 * @param  {object} req description
 * @param  {object} res description
 * @return {any}     description
 */
router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/'));
});

/**
 * anonymous function - defense
 *
 * @param  {Object} req description
 * @param  {Object} res description
 * @return {any}     description
 */
router.get('/nodefense', errorHandler(async function (req, res) {
    const url = req.query.url;

    if (!check_proto.test(url)) {
        return res.status(401).send('Invalid URL Format. Please specify Protocol (HTTP OR HTTPS)');
    }

    // make a request to user provided url
    const response = await axios.get(url);

    return res.send(response.data);
}));

/**
 * anonymous function - defense1
 *
 * @param  {Object} req description
 * @param  {Object} res description
 * @return {any}     description
 */
router.get('/defense1', errorHandler(async function (req, res) {
    const url = req.query.url,
        host = getLocation(url),
        hostname = host.hostname;

    if (!check_proto.test(url)) {
        return res.status(401).send('Invalid URL Format. Please specify Protocol (HTTP OR HTTPS)');
    }

    // Match the host part against the list of blacklist IP address.
    const blackListIps = ['127.', '0.', '192.168', '10.', '169.254', '172.'],
        isBlacklisted = blackListIps.some((pattern) => { return hostname.startsWith(pattern); });

    // make http request only if match pass
    if (isBlacklisted) {
        return res.status(423).send('Action Blocked! \n\n You are trying to access restricted IP address');
    }

    // make a request to user provided url
    const response = await axios.get(url);

    return res.send(response.data);
}));

/**
 * anonymous function - defense2
 *
 * @param  {Object} req description
 * @param  {Object} res description
 * @return {any}     description
 */
router.get('/defense2', errorHandler(async function (req, res) {
    const url = req.query.url,
        hostname = getHostname(url);

    if (!check_proto.test(url)) {
        return res.status(401).send('Invalid URL Format. Please specify Protocol (HTTP OR HTTPS)');
    }

    // check if IP address is valid
    if (ip.isV4Format(hostname) && isPrivateIP(hostname)) {
        return res.status(423).send('Action Blocked! \n\n You are trying to access restricted IP address');
    }

    // Check if domain name is valid
    if (!isValidDomain(hostname)) {
        return res.status(400).send('Invalid domain name! \n\n Please use a valid domain name');
    }

    // make a request to user provided url
    const response = await axios.get(url);

    return res.send(response.data);
}));

/**
 * anonymous function - defense3
 *
 * @param  {Object} req description
 * @param  {Object} res description
 * @return {any}     description
 */
router.get('/defense3', async function (req, res) {
    const url = req.query.url,
        hostname = getHostname(url);

    if (!check_proto.test(url)) {
        return res.status(401).send('Invalid URL Format. Please specify Protocol (HTTP OR HTTPS)');
    }

    // check if IP address is valid
    if (ip.isV4Format(hostname) && isPrivateIP(hostname)) {
        return res.status(423).send('Action Blocked! \n\n You are trying to access restricted IP address');
    }

    // Check if domain name is valid
    if (!isValidDomain(hostname)) {
        return res.status(400).send('Invalid domain name! \n\n Please use a valid domain name');
    }

    try {
        const address = await lookupPromise(hostname);

        if (isPrivateIP(address)) {
            return res.status(423).send(`Action Blocked! \n\n You are trying to access restricted IP address. Your domain name got resolved to ${address}`);
        }
    }
    catch (err) {
        if (err.code === 'ENOTFOUND') {
            return res.send('invalidCustomDomainError: Couldn\'t resolve domain name.');
        }

        // throw the error to be handled by global error handler
        throw err;
    }

    // make a request to user provided url
    const response = await axios.get(url);

    return res.send(response.data);
});

/**
 * anonymous function - defense4
 *
 * @param  {Object} req description
 * @param  {Object} res description
 * @return {any}     description
 */
router.get('/defense4', async function (req, res) {
    const url = req.query.url,
        hostname = getHostname(url);

    if (!check_proto.test(url)) {
        return res.status(401).send('Invalid URL Format. Please specify Protocol (HTTP OR HTTPS)');
    }

    // check if IP address is valid
    if (ip.isV4Format(hostname) && isPrivateIP(hostname)) {
        return res.status(423).send('Action Blocked! \n\n You are trying to access restricted IP address');
    }

    // Check if domain name is valid
    if (!isValidDomain(hostname)) {
        return res.status(400).send('Invalid domain name! \n\n Please use a valid domain name');
    }

    try {
        const address = await lookupPromise(hostname);

        // if (isPrivateIP(address)) {
        //     return res.status(423).send(`Action Blocked! \n\n You are trying to access restricted IP address. Your domain name got resolved to ${address}`);
        // }
    }
    catch (err) {
        if (err.code === 'ENOTFOUND') {
            return res.send('invalidCustomDomainError: Couldn\'t resolve domain name.');
        }

        // throw the error to be handled by global error handler
        throw err;
    }

    try {
        // make a request to user provided url
        console.log(`paased all the checks: ${url}  \n`)
        const response = await axios.get(url, { maxRedirects: 0 });

        return res.send(response.data);
    }
    catch (e) {
        return res.status(423).send(`Action Blocked! \n\n We have blocked the redirection to protect our application against SSRF vulnerability ${e}`);
    }
});

/**
 * anonymous function - defense5
 * This solution should be efficient enough to Defeat DNS rebinding vulnerability
 *
 * @param  {Object} req description
 * @param  {Object} res description
 * @return {any}     description
 */
router.get('/defense5', function (req, res) {
    res.sendFile(path.join(__dirname, '/sitemap.html'));
});

// add the router
app.use('/', router);
app.listen(port, () => { return console.log(`Hello world app listening on port ${port}!`); });
