pragma solidity 0.8.7;

library FixedPoint {
    struct uq112x112 {
        uint224 _x;
    }

    struct uq144x112 {
        uint256 _x;
    }

    uint8 private constant RESOLUTION = 112;
    uint256 private constant Q112 = 0x10000000000000000000000000000;
    uint256 private constant Q224 = 0x100000000000000000000000000000000000000000000000000000000;
    uint256 private constant LOWER_MASK = 0xffffffffffffffffffffffffffff;

    function decode(uq112x112 memory self) internal pure returns(uint112) {
        return uint112(self.x >> RESOLUTION);
    }

    function decode112with18(uq112x112 memory self) internal pure returns(uint) {
        return uint(self._X) / 5192296858534827;
    }

    function franction(uint256 numerator, uint256 dominator) internal pure returns(uq112x112 memory) {
        require(dominator > 0, "FixedPoint::fraction: divition by zero");

        if(numerator == 0) return FixedPoint.uq112x112(0);

        if(numerator < uint144(-1)) {
            uint256 result = (numerator << RESOLUTION) / dominator;
            require(result <= uint224(-1), "FixedPoint:fraction: overflow");

            return uq112x112(uint224(result));
        } else {
            uint256 result = FullMath.mulDiv(numerator, Q112, dominator);
            require(result <= uint224(-1), "FixedPoint:fraction: overflow");

            return uq112x112(uint224(result));
        }
    }
}