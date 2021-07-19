/** @jsx jsx */
import { jsx, css } from "@emotion/core";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
// import InfiniteScroll from "react-infinite-scroll-component";
import { truncatechars } from "humanize";
import SideBar from "../SideBar";
import SingleAd from "./SingleAd";
import { getAdsAsync, getMoreAdsAsync } from "../../redux/adSlice";
import { Waypoint } from "react-waypoint";
import { Spinner } from "react-bootstrap";
import { all_ads_css } from "./styles";
import axios from "axios";
import { withTranslation, i18n } from "../../i18n";

function allAds({ t }) {
  const { total, next, adsRequestStatus } = useSelector((state) => state.ads);

  const { selectedCategory, selectedLocation } = useSelector(
    (state) => state.sidebar
  );
  const [allAd, setAllAd] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const ITEMS_PER_PAGE = 10;

  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = router.query;

  // const params = {
  //   limit: limit,
  //   offset: 0,
  //   search: "",
  //   ...router.query,
  // };
  useEffect(() => {
    getData();
  }, []);
  const getData = () => {
    if (!hasNextPage) return;

    const searchUserURL = `https://api.adbazar.net/api/v1/posts/?limit=20&offset=${page}`;
    axios.get(searchUserURL).then(({ data: { results, count } }) => {
      if (results) {
        if (count === allAd.length + results.length) {
          setHasNextPage(false);
        }

        setAllAd((allAd) => [...allAd, ...results]);
        setPage((page) => page + 1);
      }
    });
  };
  const loadMoreData = () => {
    if (page > 1) {
      getData();
    }
  };
  // const handlePageChange = () => {
  //   dispatch(getMoreAdsAsync({ ...params, offset: page * limit }));
  //   setPage(page + 1);
  // };

  // // Fetch ads on first mount
  // useEffect(() => {
  //   if (allAds !== undefined && allAds.length === 0) {
  //     dispatch(getAdsAsync());
  //   }
  // }, []);
  console.log(allAd);
  return (
    <div css={all_ads_css}>
      <section className="s-space-bottom-full bg-accent-shadow-body allpost-wrapper mt-1">
        <div className="container">
          <div className="row">
            <div className="order-1 order-md-2 col-lg-9 col-md-4 col-12 p-0">
              <div className="gradient-wrapper item-mb">
                <div className="gradient-title">
                  <h2 className="d-md-none">
                    {truncatechars(
                      `(${Number(total).toLocaleString(i18n.language)}) ${t(
                        "ads"
                      )} ${user ? ", " + user : ""} ${
                        selectedCategory.name
                          ? ", " + selectedCategory.name
                          : ""
                      } ${
                        selectedLocation.name
                          ? ", " + selectedLocation.name
                          : ""
                      }`,
                      40
                    )}
                  </h2>
                  <h2 className="d-none d-md-block">
                    {`(${Number(total).toLocaleString(i18n.language)}) ${t(
                      "ads"
                    )} ${user ? ", " + user : ""} ${
                      selectedCategory.name ? ", " + selectedCategory.name : ""
                    } ${
                      selectedLocation.name ? ", " + selectedLocation.name : ""
                    }`}
                  </h2>
                </div>
                {adsRequestStatus === "pending" && (
                  <div className="text-center mt-2">
                    <Spinner animation="border" />
                  </div>
                )}

                <div className="zoom-gallery category-grid-layout1 category-list-layout2 p-2">
                  <div className="row">
                    {allAd &&
                      allAd?.map((ad, i) => (
                        <div
                          className="col-md-4 col-6 rp-padding"
                          key={`ad-${i}`}
                        >
                          <SingleAd ad={ad} t={t} />
                        </div>
                      ))}
                  </div>
                  {hasNextPage && (
                    <Waypoint onEnter={loadMoreData}>
                      <h5 className="text-muted mt-5">Loading data</h5>
                    </Waypoint>
                  )}
                </div>
              </div>
            </div>
            <div className="order-2 order-md-1 col-lg-3 col-md-8 col-12 d-none d-md-block">
              <SideBar />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

allAds.getInitialProps = async () => ({
  namespacesRequired: ["common"],
});

export default withTranslation("common")(allAds);
